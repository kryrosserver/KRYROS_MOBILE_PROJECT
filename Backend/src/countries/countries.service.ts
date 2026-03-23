import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto, SymbolPosition } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CountriesService implements OnModuleInit {
  private readonly logger = new Logger(CountriesService.name);
  private readonly EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

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

  @Cron(CronExpression.EVERY_12_HOURS)
  async updateExchangeRates() {
    this.logger.log('Updating exchange rates...');
    try {
      const response = await axios.get(this.EXCHANGE_API_URL);
      const rates = response.data.rates;

      const autoRateCountries = await this.prisma.country.findMany({
        where: { autoRate: true, status: true },
      });

      for (const country of autoRateCountries) {
        const newRate = rates[country.currencyCode];
        if (newRate) {
          await this.prisma.country.update({
            where: { id: country.id },
            data: {
              exchangeRate: newRate,
              lastRateUpdate: new Date(),
            },
          });
        }
      }
      this.logger.log('Exchange rates updated successfully');
    } catch (error) {
      this.logger.error('Failed to update exchange rates', error.message);
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

      return await this.prisma.country.create({
        data: {
          ...countryData,
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
