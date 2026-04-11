import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get('FIREBASE_SERVICE_ACCOUNT_PATH');
    
    if (serviceAccountPath) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.logger.log('Firebase Admin initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin', error.stack);
      }
    } else {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not found. Push notifications will be disabled.');
    }
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      this.logger.warn(`No FCM token found for user ${userId}`);
      return;
    }

    try {
      const message: admin.messaging.Message = {
        notification: { title, body },
        token: user.fcmToken,
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'kryros_notifications',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
      };

      await admin.messaging().send(message);
      this.logger.log(`Notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending notification to user ${userId}`, error.stack);
    }
  }

  async sendToAll(title: string, body: string, data?: any) {
    try {
      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        tokens: [], // We'll fetch all tokens
        data: data || {},
      };

      // Fetch all users with tokens
      const users = await this.prisma.user.findMany({
        where: { fcmToken: { not: null } },
        select: { fcmToken: true },
      });

      const tokens = users.map(u => u.fcmToken as string);

      if (tokens.length === 0) return;

      // Firebase limit is 500 tokens per multicast message
      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        await admin.messaging().sendEachForMulticast({
          ...message,
          tokens: batch,
        });
      }

      this.logger.log(`Broadcast notification sent to ${tokens.length} users`);
    } catch (error) {
      this.logger.error('Error sending broadcast notification', error.stack);
    }
  }

  async updateToken(userId: string, token: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });
  }
}
