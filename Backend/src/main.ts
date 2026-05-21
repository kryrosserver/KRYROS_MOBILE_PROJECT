import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { json, urlencoded } from 'express';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
    } catch {
      // DB push is optional in development — continue startup
    }
  }

  // Seed a SUPER_ADMIN account if env vars are provided and account does not exist
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (adminEmail && adminPassword) {
    const prisma = new PrismaClient();
    try {
      const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (!existing) {
        const hashed = await bcrypt.hash(adminPassword, 12);
        await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashed,
            firstName: 'Admin',
            lastName: 'User',
            role: 'SUPER_ADMIN',
            isVerified: true,
            isActive: true,
          },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  const app = await NestFactory.create(AppModule, { logger: isProd ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'] });

  // Security headers
  app.use((helmet as any).default());

  // Body size limits — kept generous for base64 image uploads
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // CORS — explicit allowlist, no localhost fallback in production
  const rawOrigins = process.env.CORS_ORIGINS || (isProd ? '' : 'http://localhost:3000,http://localhost:3001,http://localhost:5000');
  const corsList = rawOrigins
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsList.length > 0 ? corsList : false,
    credentials: true,
  });

  // Global validation — reject unknown fields and transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger — development only
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('KRYROS API')
      .setDescription('KRYROS Mobile Tech — Enterprise Commerce Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

bootstrap();
