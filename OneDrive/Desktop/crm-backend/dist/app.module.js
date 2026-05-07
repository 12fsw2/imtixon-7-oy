"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const jwt_config_1 = require("./config/jwt.config");
const reports_module_1 = require("./reports/reports.module");
const courses_module_1 = require("./courses/courses.module");
const students_module_1 = require("./students/students.module");
const groups_module_1 = require("./groups/groups.module");
const payments_module_1 = require("./payments/payments.module");
const attendance_module_1 = require("./attendance/attendance.module");
const grades_module_1 = require("./grades/grades.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, jwt_config_1.default],
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
                    limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
                },
            ]),
            reports_module_1.ReportsModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            students_module_1.StudentsModule,
            groups_module_1.GroupsModule,
            payments_module_1.PaymentsModule,
            attendance_module_1.AttendanceModule,
            grades_module_1.GradesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map