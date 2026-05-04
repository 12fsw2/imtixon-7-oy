"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const morgan = require("morgan");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port') || 3000;
    const nodeEnv = configService.get('app.nodeEnv');
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: nodeEnv === 'production' ? false : '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.use(morgan('dev'));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('CRM / SRM Backend API')
        .setDescription(`
## Corporate CRM/SRM Management System API

### Authentication
- Use \`/api/v1/auth/login\` to get access token
- Click "Authorize" button and enter: \`Bearer <your_token>\`

### Roles
- **SUPER_ADMIN**: Full access - create users, assign roles, view statistics
- **ADMIN**: Manage employees, departments, tasks, view reports  
- **EMPLOYEE**: View own tasks and profile

### Default Super Admin
- Email: \`superadmin@company.com\`
- Password: \`SuperAdmin@123\`
      `)
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Authentication', 'Login and auth endpoints')
        .addTag('Users', 'User management (Super Admin / Admin)')
        .addTag('Departments', 'Department management')
        .addTag('Tasks', 'Task management and tracking')
        .addTag('Reports', 'Dashboard and reports')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'CRM-SRM API Docs',
    });
    await app.listen(port);
    logger.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
//# sourceMappingURL=main.js.map