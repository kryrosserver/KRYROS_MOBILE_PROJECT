import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
})
export class AppModule {}
