import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get('FIREBASE_SERVICE_ACCOUNT_PATH');
    const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    
    try {
      if (serviceAccountJson) {
        // Use raw JSON string from environment variable (Best for Render)
        const config = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(config),
        });
        this.logger.log('Firebase Admin initialized via JSON string');
      } else if (serviceAccountPath) {
        // Use path to JSON file
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.logger.log('Firebase Admin initialized via file path');
      } else {
        this.logger.warn('Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH found. Push notifications will be disabled.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error.stack);
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
    scheduledAt: string;
  }) {
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

  // ==================== NOTIFICATION TEMPLATES ====================

  async sendOrderStatusNotification(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
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
      case 'DELIVERED':
        title = 'Order Delivered! 🏠';
        body = `Your order ${order.orderNumber} has been successfully delivered. Enjoy your purchase!`;
        break;
      case 'CANCELLED':
        title = 'Order Cancelled';
        body = `Your order ${order.orderNumber} has been cancelled. If you have questions, please contact support.`;
        break;
    }

    await this.sendToUser(order.userId, title, body, { 
      orderId, 
      status, 
      url: `/dashboard/orders/${orderId}` 
    });
  }
}
