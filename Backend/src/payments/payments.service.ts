import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly testUrl = 'http://test.543.cgrate.co.zm:55555/Konik/KonikWs';
  private readonly prodUrl = 'https://543.cgrate.co.zm:8443/';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private get apiUrl() {
    return this.configService.get('NODE_ENV') === 'production' ? this.prodUrl : this.testUrl;
  }

  async process543Payment(orderId: string, phone: string, amountZMW: number) {
    const username = this.configService.get('CGRATE_USERNAME');
    const password = this.configService.get('CGRATE_PASSWORD');
    const transactionId = `KRYROS_${Date.now()}`;

    // Ensure phone format: +260XXXXXXXXX
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('260')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '260' + formattedPhone.substring(1);
      } else {
        formattedPhone = '260' + formattedPhone;
      }
    }
    formattedPhone = '+' + formattedPhone;

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:kon="http://konik.cgrate.com">
         <soapenv:Header/>
         <soapenv:Body>
            <kon:processTransaction>
               <transactionRequest>
                  <username>${username}</username>
                  <password>${password}</password>
                  <msisdn>${formattedPhone}</msisdn>
                  <amount>${amountZMW}</amount>
                  <transactionId>${transactionId}</transactionId>
                  <action>MOBILE_MONEY_PUSH</action>
               </transactionRequest>
            </kon:processTransaction>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    try {
      this.logger.log(`Initiating 543 payment for Order: ${orderId}, Amount: ${amountZMW} ZMW`);
      
      const response = await axios.post(this.apiUrl, soapRequest, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
        },
      });

      const parser = new XMLParser({
        ignoreAttributes: true,
        removeNSPrefix: true,
      });
      const result = parser.parse(response.data);
      
      const txResponse = result.Envelope?.Body?.processTransactionResponse?.transactionResponse;

      if (!txResponse) {
        throw new Error('Invalid SOAP response structure');
      }

      const status = txResponse.status; // SUCCESS, FAILED, PENDING
      const reference = txResponse.reference || transactionId;

      // Update order status in DB
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentReference: reference,
          paymentPhone: phone,
          paymentStatus: this.mapStatus(status),
        },
      });

      return {
        success: status === 'SUCCESS',
        status: status,
        reference: reference,
        message: txResponse.message || 'Payment initiated',
      };
    } catch (error) {
      this.logger.error(`543 Payment Error: ${error.message}`);
      
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });

      throw error;
    }
  }

  private mapStatus(status: string): any {
    switch (status) {
      case 'SUCCESS': return 'PAID';
      case 'FAILED': return 'FAILED';
      default: return 'PENDING';
    }
  }

  async checkStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !order.paymentReference) return null;

    const username = this.configService.get('CGRATE_USERNAME');
    const password = this.configService.get('CGRATE_PASSWORD');

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:kon="http://konik.cgrate.com">
         <soapenv:Header/>
         <soapenv:Body>
            <kon:queryTransaction>
               <queryRequest>
                  <username>${username}</username>
                  <password>${password}</password>
                  <transactionId>${order.paymentReference}</transactionId>
               </queryRequest>
            </kon:queryTransaction>
         </soapenv:Body>
      </soapenv:Envelope>
    `;

    try {
      const response = await axios.post(this.apiUrl, soapRequest, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
        },
      });

      const parser = new XMLParser({
        ignoreAttributes: true,
        removeNSPrefix: true,
      });
      const result = parser.parse(response.data);
      const txResponse = result.Envelope?.Body?.queryTransactionResponse?.queryResponse;

      if (txResponse) {
        const newStatus = this.mapStatus(txResponse.status);
        if (newStatus !== order.paymentStatus) {
          await this.prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: newStatus },
          });
        }
        return { status: newStatus, raw: txResponse.status };
      }
    } catch (error) {
      this.logger.error(`Status Check Error: ${error.message}`);
    }
    return null;
  }
}
