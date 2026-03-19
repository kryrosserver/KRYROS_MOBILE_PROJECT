import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShippingZonesModule } from '../shipping-zones/shipping-zones.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ShippingZonesModule, SettingsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
