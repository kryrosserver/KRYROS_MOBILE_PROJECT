import { Injectable, Logger, OnModuleInit, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly beemBaseUrl = 'https://apisms.beem.africa/v1/send';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  onModuleInit() {
    const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    
    if (!serviceAccountJson) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not found. Push notifications disabled.');
      return;
    }

    try {
      const config = JSON.parse(serviceAccountJson);
      
      // Safety check: Ensure it's an Admin SDK JSON, not a Client JSON
      if (!config.private_key || !config.client_email) {
        this.logger.error('The FIREBASE_SERVICE_ACCOUNT_JSON appears to be a client config (google-services.json) instead of an Admin SDK key. Push notifications will be disabled to prevent crashes.');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(config),
      });
      this.logger.log('Firebase Admin initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin. The JSON format might be invalid.', error.message);
      // We DO NOT throw the error here, so the rest of the app (like SMS) keeps working
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications() {
    const now = new Date();
    const scheduled = await this.prisma.notification.findMany({
      where: {
        sent: false,
        scheduledAt: { lte: now },
      },
    });

    if (scheduled.length === 0) return;

    this.logger.log(`Processing ${scheduled.length} scheduled notifications`);

    for (const notification of scheduled) {
      try {
        if (notification.userId) {
          await this.sendToUser(notification.userId, notification.title, notification.message, notification.data);
        } else {
          await this.sendToAll(notification.title, notification.message, notification.data);
        }

        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { sent: true },
        });
      } catch (error) {
        this.logger.error(`Failed to process scheduled notification ${notification.id}`, error.stack);
      }
    }
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    const userDevices = await this.prisma.userDevice.findMany({
      where: { userId },
      select: { fcmToken: true, id: true },
    });

    if (userDevices.length === 0) {
      this.logger.warn(`No FCM tokens found for user ${userId}`);
      return;
    }

    const tokens = userDevices.map(d => d.fcmToken);
    await this.sendToTokens(tokens, title, body, data);
    
    // Log in database
    await this.prisma.notification.create({
      data: {
        userId,
        title,
        message: body,
        data: data || {},
        targetType: 'SINGLE',
        sent: true,
      },
    });
  }

  async sendToOrders(orderIds: string[], title: string, body: string, data?: any) {
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { userId: true, orderNumber: true },
    });

    const userIds = [...new Set(orders.map(o => o.userId).filter(id => !!id))] as string[];
    
    for (const userId of userIds) {
      await this.sendToUser(userId, title, body, { ...data, orderIds });
    }

    // Log in database
    await this.prisma.notification.create({
      data: {
        orderIds,
        title,
        message: body,
        data: data || {},
        targetType: 'BULK',
        sent: true,
      },
    });
  }

  async sendByOrderStatus(status: string, title: string, body: string, data?: any) {
    const orders = await this.prisma.order.findMany({
      where: { status: status as any },
      select: { userId: true },
    });

    const userIds = [...new Set(orders.map(o => o.userId).filter(id => !!id))] as string[];
    
    for (const userId of userIds) {
      await this.sendToUser(userId, title, body, data);
    }
  }

  async scheduleNotification(params: {
    title: string;
    body: string;
    targetType: string;
    userId?: string;
    orderIds?: string[];
    orderStatus?: string;
    data?: any;
    scheduledAt?: string;
  }) {
    if (!params.scheduledAt) {
      throw new Error('scheduledAt is required for scheduled notifications');
    }
    
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.body,
        targetType: params.targetType,
        data: params.data || {},
        scheduledAt: new Date(params.scheduledAt),
        sent: false,
      },
    });
  }

  private async sendToTokens(tokens: string[], title: string, body: string, data?: any) {
    if (tokens.length === 0) return;

    try {
      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        tokens,
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'kryros_notifications',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/logo-pwa.png',
            badge: '/favicon.svg',
          },
          fcmOptions: {
            link: data?.url || '/',
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Handle invalid tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            // Messaging error codes: https://firebase.google.com/docs/cloud-messaging/send-message#error_codes
            if (errorCode === 'messaging/invalid-registration-token' || 
                errorCode === 'messaging/registration-token-not-registered' ||
                errorCode === 'messaging/mismatched-credential') {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await this.prisma.userDevice.deleteMany({
            where: { fcmToken: { in: failedTokens } },
          });
          this.logger.log(`Cleaned up ${failedTokens.length} invalid tokens`);
        }
      }

      this.logger.log(`Successfully sent to ${response.successCount} devices`);
    } catch (error) {
      this.logger.error('Error sending multicast notification', error.stack);
    }
  }

  async sendToAll(title: string, body: string, data?: any) {
    try {
      const devices = await this.prisma.userDevice.findMany({
        select: { fcmToken: true },
      });

      const tokens = devices.map(d => d.fcmToken);

      if (tokens.length === 0) return;

      // Firebase limit is 500 tokens per multicast message
      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        await this.sendToTokens(batch, title, body, data);
      }

      // Log in database
      await this.prisma.notification.create({
        data: {
          title,
          message: body,
          data: data || {},
          targetType: 'BULK',
          sent: true,
        },
      });

      this.logger.log(`Broadcast notification sent to ${tokens.length} tokens`);
    } catch (error) {
      this.logger.error('Error sending broadcast notification', error.stack);
    }
  }

  async updateToken(userId: string, token: string, platform: string = 'android') {
    await this.prisma.userDevice.upsert({
      where: { fcmToken: token },
      update: { userId, platform, updatedAt: new Date() },
      create: { userId, fcmToken: token, platform },
    });
  }

  // ==================== SMS (BEEM AFRICA) ====================

  async sendSMS(phoneNumber: string, message: string) {
    const apiKey = this.configService.get('BEEM_API_KEY');
    const secretKey = this.configService.get('BEEM_SECRET_KEY');
    const senderName = this.configService.get('BEEM_SENDER_NAME') || 'INFO';

    if (!apiKey || !secretKey) {
      this.logger.error('BEEM_API_KEY or BEEM_SECRET_KEY not found in environment');
      throw new BadRequestException('SMS service credentials (API Key or Secret Key) are missing from the backend settings.');
    }

    try {
      // CLEAN PHONE NUMBER: Remove everything except numbers
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // INTERNATIONAL SUPPORT:
      // If it starts with 0 and is 11 digits (Nigeria local: 0703...), add 234 prefix
      if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
        formattedPhone = '234' + formattedPhone.substring(1);
      }
      // If it starts with 0 and is 10 digits (Zambia local: 097...), add 260 prefix
      else if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
        formattedPhone = '260' + formattedPhone.substring(1);
      }
      
      // If the number is already in international format (like 234... or 260...)
      // Beem Africa will accept it as is as long as it's just numbers.

      const auth = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
      this.logger.log(`Final formatted number being sent to Beem: ${formattedPhone}`);

      const response = await axios.post(
        this.beemBaseUrl,
        {
          source_addr: senderName.substring(0, 11),
          schedule_time: '',
          encoding: '0',
          message: message,
          recipients: [
            {
              recipient_id: String(Date.now()), // Must be a unique string/number
              dest_addr: formattedPhone,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return { success: true, data: response.data };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || error.message;
      
      // We now include the formatted phone number in the error so the user can see it
      const finalPhone = phoneNumber.replace(/\D/g, '');
      throw new InternalServerErrorException({
        message: `Beem Africa Error: ${errorMsg}. (Tried sending to: ${finalPhone})`,
        details: errorData
      });
    }
  }

  // ==================== NOTIFICATION TEMPLATES ====================

  async sendOrderStatusNotification(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        shippingAddress: true,
      } as any,
    });

    if (!order || !order.userId) return;

    let title = 'Order Update';
    let body = `Your order ${order.orderNumber} status has changed to ${status}.`;

    switch (status) {
      case 'CONFIRMED':
        title = 'Order Confirmed! 🎉';
        body = `Your order ${order.orderNumber} has been confirmed and is being prepared.`;
        break;
      case 'PROCESSING':
        title = 'Processing Your Order 📦';
        body = `We're currently processing your order ${order.orderNumber}. We'll notify you when it ships!`;
        break;
      case 'SHIPPED':
        title = 'Order Shipped! 🚚';
        body = `Great news! Your order ${order.orderNumber} is on its way. Track it in the app.`;
        break;
      case 'OUT_FOR_DELIVERY':
        title = 'Out for Delivery 🏃';
        body = `Your order ${order.orderNumber} is out for delivery today!`;
        break;
      case 'DELIVERED':
        title = 'Order Delivered! 🏠';
        body = `Your order ${order.orderNumber} has been successfully delivered. Enjoy your purchase!`;
        break;
      case 'CANCELLED':
        title = 'Order Cancelled';
        body = `Your order ${order.orderNumber} has been cancelled. If you have questions, please contact support.`;
        break;
      case 'REFUNDED':
        title = 'Refund Processed 💰';
        body = `Your refund for order ${order.orderNumber} has been processed.`;
        break;
    }

    // ── 1. Push notification (non-blocking) ──────────────────────────────
    this.sendToUser(order.userId, title, body, {
      orderId,
      status,
      url: `/dashboard/orders/${orderId}`,
    }).catch(e => this.logger.warn(`Push notification failed for order ${order.orderNumber}: ${e.message}`));

    // ── 2. Email notification ─────────────────────────────────────────────
    const userEmail = (order as any).user?.email || (order as any).shippingAddress?.email;
    const firstName = (order as any).user?.firstName || (order as any).shippingAddress?.firstName || 'Valued Customer';
    if (userEmail) {
      this.mailerService.sendOrderStatusEmail({
        to: userEmail,
        firstName,
        orderNumber: order.orderNumber,
        status,
        trackingUrl: `${this.configService.get('FRONTEND_URL') || 'https://kryros-interface.onrender.com'}/orders/${orderId}`,
      }).catch(e => this.logger.warn(`Email notification failed for order ${order.orderNumber}: ${e.message}`));
    }

    // ── 3. SMS notification (Zambia for now, non-blocking) ────────────────
    const smsPhone = (order as any).shippingAddress?.phone || (order as any).user?.phone;
    if (smsPhone) {
      this.sendSMS(smsPhone, `KRYROS: ${title} - ${body}`)
        .catch(e => this.logger.warn(`SMS notification failed for order ${order.orderNumber}: ${e.message}`));
    }
  }

  // ─── New: Send order placed notification (push + email + SMS) ────────────
  async sendOrderPlacedNotification(orderId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          shippingAddress: true,
          items: {
            include: { product: { select: { name: true } } },
            take: 5,
          },
        } as any,
      });

      if (!order) return;

      const firstName = (order as any).user?.firstName || (order as any).shippingAddress?.firstName || 'Valued Customer';
      const userEmail = (order as any).user?.email || (order as any).shippingAddress?.email;
      const total = order.totalZMW ? `K${Number(order.totalZMW).toLocaleString()}` : `${order.currencyCode} ${order.total}`;
      const currency = order.currencyCode || 'ZMW';

      const address = (order as any).shippingAddress;
      const shippingAddr = address
        ? [address.street, address.city, address.state, address.country].filter(Boolean).join(', ')
        : undefined;

      // ── 1. Push ──────────────────────────────────────────────────────────
      if (order.userId) {
        this.sendToUser(
          order.userId,
          'Order Placed! 🛍️',
          `Your order #${order.orderNumber} has been received. Total: ${total}`,
          { orderId, type: 'ORDER_PLACED' },
        ).catch(e => this.logger.warn(`Push failed for new order ${order.orderNumber}: ${e.message}`));
      }

      // ── 2. Email confirmation ────────────────────────────────────────────
      if (userEmail) {
        this.mailerService.sendOrderConfirmationEmail({
          to: userEmail,
          firstName,
          orderNumber: order.orderNumber,
          total,
          currency,
          paymentMethod: (order.paymentMethod || 'Standard').replace(/_/g, ' '),
          shippingAddress: shippingAddr,
          trackingUrl: `${this.configService.get('FRONTEND_URL') || 'https://kryros-interface.onrender.com'}/orders/${orderId}`,
        }).catch(e => this.logger.warn(`Order confirmation email failed for ${order.orderNumber}: ${e.message}`));
      }

      // ── 3. SMS ───────────────────────────────────────────────────────────
      const smsPhone = address?.phone || (order as any).user?.phone;
      if (smsPhone) {
        this.sendSMS(smsPhone, `KRYROS: Order #${order.orderNumber} received! Total: ${total}. We'll confirm shortly.`)
          .catch(e => this.logger.warn(`Order SMS failed for ${order.orderNumber}: ${e.message}`));
      }

    } catch (error) {
      this.logger.error(`sendOrderPlacedNotification failed for ${orderId}`, error.message);
    }
  }

  // ─── SMS Contacts ─────────────────────────────────────────────────────────
  async getSmsContacts() {
    return this.prisma.smsContact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async addSmsContact(phone: string, name?: string, source: string = 'Manual') {
    if (!phone?.trim()) return { success: false, message: 'Phone number is required' };
    const normalised = phone.trim();
    try {
      const contact = await this.prisma.smsContact.upsert({
        where: { phone: normalised },
        update: { name: name ?? undefined, isActive: true },
        create: { phone: normalised, name: name ?? null, source },
      });
      return { success: true, contact };
    } catch (error) {
      this.logger.warn(`SMS contact upsert failed for ${normalised}: ${error.message}`);
      return { success: false, message: 'Could not register contact' };
    }
  }

  async deleteSmsContact(id: string) {
    try {
      await this.prisma.smsContact.delete({ where: { id } });
      return { success: true };
    } catch {
      return { success: false, message: 'Contact not found' };
    }
  }

}
