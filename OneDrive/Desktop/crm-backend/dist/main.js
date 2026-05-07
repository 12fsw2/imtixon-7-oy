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
        .setTitle('O\'quv Markaz CRM API')
        .setDescription(`
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
      `)
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Faqat tokenni kiriting (Bearer avtomatik qo\'shiladi)',
        in: 'header',
    }, 'JWT-auth')
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map