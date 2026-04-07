import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto, SymbolPosition } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CountriesService implements OnModuleInit {
  private readonly logger = new Logger(CountriesService.name);
  private readonly PRIMARY_EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
  private readonly FALLBACK_EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      // Seed default USD and ZMW if not exists
      await this.seedDefaults();
      // Initial rate update
      await this.updateExchangeRates();
    } catch (error) {
      this.logger.error('Failed to initialize CountriesService. Database tables might be missing.', error.message);
    }
  }

  async seedDefaults() {
    try {
      const usd = await this.prisma.country.findUnique({ where: { code: 'US' } });
      if (!usd) {
        await this.prisma.country.create({
          data: {
            name: 'United States',
            code: 'US',
            currencyCode: 'USD',
            currencySymbol: '$',
            symbolPosition: SymbolPosition.BEFORE,
            exchangeRate: 1.0,
            autoRate: false,
            isDefault: true,
            flag: '🇺🇸',
          },
        });
        this.logger.log('Seeded default country: US');
      }

      const zmw = await this.prisma.country.findUnique({ where: { code: 'ZM' } });
      if (!zmw) {
        const country = await this.prisma.country.create({
          data: {
            name: 'Zambia',
            code: 'ZM',
            currencyCode: 'ZMW',
            currencySymbol: 'ZK',
            symbolPosition: SymbolPosition.BEFORE,
            exchangeRate: 27.2,
            autoRate: true,
            flag: '🇿🇲',
          },
        });

        // Add default payment methods for Zambia
        await this.prisma.countryPaymentMethod.createMany({
          data: [
            { countryId: country.id, name: 'MTN Mobile Money' },
            { countryId: country.id, name: 'Airtel Money' },
            { countryId: country.id, name: 'Zambian Bank Transfer' },
          ],
        });
        this.logger.log('Seeded default country: ZM with payment methods');
      }

      return { message: 'Seed completed' };
    } catch (error) {
      this.logger.error('Seed operation failed:', error.message);
      throw new BadRequestException(`Seed failed: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateExchangeRates() {
    this.logger.log('Updating exchange rates (Hourly Cron)...');
    
    let rates = null;
    
    // 1. Try Primary Provider
    try {
      this.logger.log(`Attempting to fetch rates from Primary Provider: ${this.PRIMARY_EXCHANGE_API}`);
      const response = await axios.get(this.PRIMARY_EXCHANGE_API);
      rates = response.data.rates;
    } catch (primaryError) {
      this.logger.error('Primary Provider failed, attempting fallback...', primaryError.message);
      
      // 2. Try Fallback Provider
      try {
        this.logger.log(`Attempting to fetch rates from Fallback Provider: ${this.FALLBACK_EXCHANGE_API}`);
        const response = await axios.get(this.FALLBACK_EXCHANGE_API);
        rates = response.data.rates;
      } catch (fallbackError) {
        this.logger.error('All exchange rate providers failed.', fallbackError.message);
        throw new BadRequestException('Failed to fetch live rates from all providers');
      }
    }

    if (!rates) {
      throw new BadRequestException('Received empty rates from providers');
    }

    try {
      const autoRateCountries = await this.prisma.country.findMany({
        where: { autoRate: true, status: true },
      });

      for (const country of autoRateCountries) {
        const newRate = rates[country.currencyCode];
        if (newRate) {
          await this.prisma.country.update({
            where: { id: country.id },
            data: {
              exchangeRate: parseFloat(newRate.toFixed(4)),
              lastRateUpdate: new Date(),
            },
          });
          this.logger.log(`Updated rate for ${country.currencyCode}: ${newRate}`);
        }
      }
      this.logger.log('Exchange rates updated successfully');
      return { message: 'Rates updated successfully', updated: autoRateCountries.length };
    } catch (dbError) {
      this.logger.error('Failed to save updated rates to database', dbError.message);
      throw new BadRequestException(`Failed to save rates: ${dbError.message}`);
    }
  }

  async create(createCountryDto: CreateCountryDto) {
    const { paymentMethods, ...countryData } = createCountryDto;

    try {
      // Check if country already exists by name or code
      const existing = await this.prisma.country.findFirst({
        where: {
          OR: [
            { name: countryData.name },
            { code: countryData.code },
          ],
        },
      });

      if (existing) {
        throw new BadRequestException(`Country with name "${countryData.name}" or code "${countryData.code}" already exists`);
      }

      // If autoRate is enabled, or rate is 1.0, fetch the initial rate from the API immediately
      let initialRate = countryData.exchangeRate || 1.0;
      if (countryData.autoRate || initialRate === 1.0) {
        try {
          const response = await axios.get(this.PRIMARY_EXCHANGE_API);
          const rate = response.data.rates[countryData.currencyCode];
          if (rate) {
            initialRate = parseFloat(rate.toFixed(4));
            this.logger.log(`Fetched initial rate for ${countryData.currencyCode}: ${initialRate}`);
          }
        } catch (apiError) {
          this.logger.warn(`Failed to fetch initial rate for ${countryData.currencyCode}, using provided/default rate.`, apiError.message);
        }
      }

      return await this.prisma.country.create({
        data: {
          ...countryData,
          exchangeRate: initialRate,
          lastRateUpdate: countryData.autoRate ? new Date() : null,
          paymentMethods: {
            create: paymentMethods || [],
          },
        },
        include: {
          paymentMethods: true,
        },
      });
    } catch (error) {
      this.logger.error('Error creating country:', error.message);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.country.findMany({
      where: { status: true },
      include: {
        paymentMethods: {
          where: { isActive: true },
        },
      },
      orderBy: { isDefault: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.country.findUnique({
      where: { id },
      include: {
        paymentMethods: true,
      },
    });
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    const { paymentMethods, ...countryData } = updateCountryDto;
    
    // If updating payment methods, it's easier to handle them separately or use a more complex logic
    // For now, let's just update the country fields
    return this.prisma.country.update({
      where: { id },
      data: countryData,
      include: {
        paymentMethods: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.country.delete({
      where: { id },
    });
  }

  async addPaymentMethod(countryId: string, data: any) {
    return this.prisma.countryPaymentMethod.create({
      data: {
        ...data,
        countryId,
      },
    });
  }

  async updatePaymentMethod(id: string, data: any) {
    return this.prisma.countryPaymentMethod.update({
      where: { id },
      data,
    });
  }

  async removePaymentMethod(id: string) {
    return this.prisma.countryPaymentMethod.delete({
      where: { id },
    });
  }
}
