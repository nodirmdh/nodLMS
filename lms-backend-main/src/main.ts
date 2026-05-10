import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { initSentry } from './common/sentry/sentry.init';
import { SentryExceptionFilter } from './common/sentry/sentry.filter';
import { swaggerBasicAuth } from './common/middleware/swagger-auth.middleware';
import { registerBullBoard } from './queues/bull-board.setup';

async function bootstrap() {
  // Sentry must be initialized before Nest app is created so early errors
  // are captured too.
  initSentry();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const isProd = process.env.NODE_ENV === 'production';

  // --- Security headers ---
  app.use(
    helmet({
      // Swagger UI loads inline scripts/styles; keep CSP disabled to avoid
      // breaking /docs in development while still benefiting from other
      // headers (X-Frame-Options, X-Content-Type-Options, etc).
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // --- Global validation ---
  // NOTE: `whitelist` and `forbidNonWhitelisted` are intentionally NOT enabled
  // yet because a number of controllers still accept raw Prisma types (Group,
  // Course, Fine, Bonus, Transaction, Lesson). Turning them on at this stage
  // would strip all fields and break the existing frontend.
  // Ticket: enable strict validation once DTOs are rolled out (see
  // MODERNIZATION_PLAN.md Phase 2 / Backend cleanup).
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  // --- Global exception filter ---
  app.useGlobalFilters(new SentryExceptionFilter());

  // --- CORS (env-driven, comma-separated list) ---
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : ['http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- Swagger ---
  // In production it's protected by basic-auth IF SWAGGER_USER/SWAGGER_PASSWORD
  // are provided. Otherwise /docs is disabled entirely in production.
  const swaggerProtected =
    !!process.env.SWAGGER_USER && !!process.env.SWAGGER_PASSWORD;

  if (!isProd || swaggerProtected) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('CRM')
      .setVersion('0.1alpha')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    if (isProd) {
      // Guard /docs with basic auth in production
      app.use('/docs', swaggerBasicAuth);
      app.use('/docs-json', swaggerBasicAuth);
    }

    SwaggerModule.setup('docs', app, document);
    logger.log(
      `Swagger enabled at /docs${isProd ? ' (basic-auth protected)' : ''}`,
    );
  } else {
    logger.log('Swagger disabled in production (no SWAGGER_USER configured)');
  }

  // --- Static assets (uploaded avatars) ---
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  // --- Bull Board UI at /admin/queues ---
  // In prod: protected by the same basic-auth as Swagger. In dev: open.
  const swaggerConfigured =
    !!process.env.SWAGGER_USER && !!process.env.SWAGGER_PASSWORD;
  registerBullBoard(app, swaggerConfigured ? swaggerBasicAuth : undefined);

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application listening on :${port} [NODE_ENV=${process.env.NODE_ENV ?? 'development'}]`);
}

bootstrap();
