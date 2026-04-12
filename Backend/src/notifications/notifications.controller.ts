import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SendNotificationDto, NotificationTargetType } from './dto/send-notification.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user FCM token' })
  async updateToken(@Request() req: any, @Body() body: UpdateTokenDto) {
    return this.notificationsService.updateToken(req.user.id, body.token, body.platform || 'android');
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send broadcast notification (Admin only)' })
  async broadcast(@Body() body: { title: string; body: string; data?: any }) {
    return this.notificationsService.sendToAll(body.title, body.body, body.data);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send targeted notification (Admin only)' })
  async sendTargeted(@Body() body: SendNotificationDto) {
    if (body.scheduledAt) {
      return this.notificationsService.scheduleNotification(body);
    }

    if (body.targetType === NotificationTargetType.SINGLE && body.userId) {
      return this.notificationsService.sendToUser(body.userId, body.title, body.body, body.data);
    }

    if (body.targetType === NotificationTargetType.BULK && body.orderIds) {
      return this.notificationsService.sendToOrders(body.orderIds, body.title, body.body, body.data);
    }

    if (body.targetType === NotificationTargetType.STATUS_BASED && body.orderStatus) {
      return this.notificationsService.sendByOrderStatus(body.orderStatus, body.title, body.body, body.data);
    }
  }
}
