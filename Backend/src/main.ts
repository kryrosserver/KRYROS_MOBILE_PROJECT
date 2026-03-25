import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  try {
    if (!isProd) {
      execSync('npx prisma db push', { stdio: 'inherit' });
    }
  } catch (e) {
    console.log('Prisma db push failed or was skipped');
  }

  // Seed default SUPER_ADMIN if env vars are provided
  try {
    const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD;
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const prisma = new PrismaClient();
      const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
      if (!existing) {
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await prisma.user.create({
          data: {
            email: ADMIN_EMAIL,
            password: hashed,
            firstName: 'Admin',
            lastName: 'User',
            role: 'SUPER_ADMIN',
            isVerified: true,
            isActive: true,
          },
        });
        console.log('✅ Seeded SUPER_ADMIN account:', ADMIN_EMAIL);
      } else {
        console.log('ℹ️ SUPER_ADMIN already exists:', ADMIN_EMAIL);
      }
      await prisma.$disconnect();
    } else {
      console.log('ℹ️ Skipping admin seed (ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set)');
    }
  } catch (e) {
    console.log('Admin seed step failed:', e);
  }
  const app = await NestFactory.create(AppModule);
  
  // Increase request body size limits to allow image uploads via base64 (data URLs)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Enable CORS for multiple origins
  const corsList = (process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    'https://kryros.com, https://www.kryros.com, https://kryrosweb-dr6p.onrender.com, https://kryrosadmin.onrender.com, http://localhost:3000, http://localhost:3001')
    .split(',')
    .map((s) => s.trim());
  app.enableCors({
    origin: corsList,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true, // Commented out to prevent strict rejection of unexpected fields
    }),
  );

  // Swagger documentation (disabled in production to reduce memory usage)
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('KRYROS API')
      .setDescription('KRYROS Mobile Tech - Enterprise Commerce Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 KRYROS API is running on: http://localhost:${port}`);
  if (!isProd) {
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
