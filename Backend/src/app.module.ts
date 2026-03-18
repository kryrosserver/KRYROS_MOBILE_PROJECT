import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { CreditModule } from './credit/credit.module';
import { WalletModule } from './wallet/wallet.module';
import { WholesaleModule } from './wholesale/wholesale.module';
import { ServicesModule } from './services/services.module';
import { CMSModule } from './cms/cms.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { SettingsModule } from './settings/settings.module';
import { ShippingModule } from './shipping/shipping.module';
import { BrandsModule } from './brands/brands.module';
import { CountriesModule } from './countries/countries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // default TTL in seconds
      max: 100, // maximum number of items in cache
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    CreditModule,
    WalletModule,
    WholesaleModule,
    ServicesModule,
    CMSModule,
    PaymentsModule,
    ReportsModule,
    WishlistModule,
    SettingsModule,
    ShippingModule,
    BrandsModule,
    CountriesModule,
  ],
})
export class AppModule {}
