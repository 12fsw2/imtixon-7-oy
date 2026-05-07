import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('app.nodeEnv');

  // Security
  app.use(helmet());
  app.enableCors({
    origin: nodeEnv === 'production' ? false : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Logging
  app.use(morgan('dev'));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('O\'quv Markaz CRM API')
    .setDescription(
      `
## O'quv Markaz Boshqaruv Tizimi API

### Authentication
- \`/api/v1/auth/login\` orqali token oling
- "Authorize" tugmasini bosib tokenni kiriting

### Rollar
- **SUPER_ADMIN**: To'liq huquq
- **ADMIN**: Boshqaruv huquqi
- **TEACHER**: O'qituvchi huquqi
- **CASHIER**: Kassir huquqi
- **STUDENT**: Talaba huquqi
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Faqat tokenni kiriting (Bearer avtomatik qo\'shiladi)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login va auth endpointlar')
    .addTag('Users', 'Foydalanuvchilar boshqaruvi')
    .addTag('Courses', 'Kurslar boshqaruvi')
    .addTag('Students', 'Talabalar boshqaruvi')
    .addTag('Groups', 'Guruhlar boshqaruvi')
    .addTag('Payments', 'To\'lovlar boshqaruvi')
    .addTag('Attendance', 'Davomat boshqaruvi')
    .addTag('Grades', 'Baholar boshqaruvi')
    .addTag('Reports', 'Dashboard va hisobotlar')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'O\'quv Markaz CRM API Docs',
  });

  const PORT = process.env.PORT ?? 4001;

  await app.listen(PORT, () => {
    console.log(`🚀 Root api for project: http://localhost:${PORT}/api/v1`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
  });
}

bootstrap();