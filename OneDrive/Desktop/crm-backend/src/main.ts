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
  const port = configService.get<number>('app.port') || 3000;
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
    .setTitle('CRM / SRM Backend API')
    .setDescription(
      `
## Corporate CRM/SRM Management System API

### Authentication
- Use \`/api/v1/auth/login\` to get access token
- Click "Authorize" button and enter JWT token (Bearer avtomatik qoshiladi)

### Roles
- **SUPER_ADMIN**: Full access - create users, assign roles, view statistics
- **ADMIN**: Manage employees, departments, tasks, view reports  
- **EMPLOYEE**: View own tasks and profile
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Faqat tokenni kiriting (Bearer avtomatik qoshiladi)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login and auth endpoints')
    .addTag('Users', 'User management (Super Admin / Admin)')
    .addTag('Departments', 'Department management')
    .addTag('Tasks', 'Task management and tracking')
    .addTag('Reports', 'Dashboard and reports')
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
    customSiteTitle: 'CRM-SRM API Docs',
  });

  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT, () => {
    console.log(`🚀 Root api for project: http://localhost:${PORT}/api/v1`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
  });
}

bootstrap();