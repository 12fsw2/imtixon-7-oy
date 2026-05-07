"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const group_entity_1 = require("../groups/entities/group.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const attendance_entity_1 = require("../attendance/entities/attendance.entity");
const user_entity_1 = require("../users/entities/user.entity");
let ReportsService = class ReportsService {
    constructor(studentRepository, groupRepository, paymentRepository, attendanceRepository, userRepository) {
        this.studentRepository = studentRepository;
        this.groupRepository = groupRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }
    async getDashboard() {
        const [studentStats, teacherCount, groupStats, paymentStats, monthlyStats] = await Promise.all([
            this.getStudentStats(),
            this.getTeacherCount(),
            this.getGroupStats(),
            this.getPaymentStats(),
            this.getMonthlyStats(),
        ]);
        return {
            students: studentStats,
            teachers: teacherCount,
            groups: groupStats,
            payments: paymentStats,
            monthlyStats,
        };
    }
    async getStudentStats() {
        const stats = await this.studentRepository
            .createQueryBuilder('student')
            .select([
            'COUNT(*) as total',
            `SUM(CASE WHEN student.status = 'ACTIVE' THEN 1 ELSE 0 END) as active`,
            `SUM(CASE WHEN student.status = 'INACTIVE' THEN 1 ELSE 0 END) as leftThisMonth`,
            `SUM(CASE WHEN student.createdAt >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as newThisMonth`,
        ])
            .getRawOne();
        return {
            total: parseInt(stats.total),
            active: parseInt(stats.active),
            leftThisMonth: parseInt(stats.leftthismonth),
            newThisMonth: parseInt(stats.newthismonth),
        };
    }
    async getTeacherCount() {
        const count = await this.userRepository
            .createQueryBuilder('user')
            .where('user.role = :role', { role: 'TEACHER' })
            .andWhere('user.isActive = true')
            .getCount();
        return { total: count };
    }
    async getGroupStats() {
        const stats = await this.groupRepository
            .createQueryBuilder('group')
            .select([
            'COUNT(*) as total',
            `SUM(CASE WHEN group.status = 'ACTIVE' THEN 1 ELSE 0 END) as active`,
            `SUM(CASE WHEN group.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed`,
        ])
            .getRawOne();
        return {
            total: parseInt(stats.total),
            active: parseInt(stats.active),
            completed: parseInt(stats.completed),
        };
    }
    async getPaymentStats() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const stats = await this.paymentRepository
            .createQueryBuilder('payment')
            .select([
            'SUM(payment.paidAmount) as totalPaid',
            'SUM(payment.amount) as totalAmount',
            `SUM(CASE WHEN payment.month = '${currentMonth}' THEN payment.paidAmount ELSE 0 END) as thisMonthPaid`,
            `SUM(CASE WHEN payment.status = 'OVERDUE' THEN payment.amount - payment.paidAmount ELSE 0 END) as totalDebt`,
        ])
            .getRawOne();
        return {
            totalPaid: parseFloat(stats.totalpaid) || 0,
            totalAmount: parseFloat(stats.totalamount) || 0,
            thisMonthPaid: parseFloat(stats.thismontpaid) || 0,
            totalDebt: parseFloat(stats.totaldebt) || 0,
        };
    }
    async getMonthlyStats() {
        const stats = await this.studentRepository
            .createQueryBuilder('student')
            .select([
            `TO_CHAR(student.createdAt, 'YYYY-MM') as month`,
            'COUNT(*) as total',
            `SUM(CASE WHEN student.status = 'INACTIVE' THEN 1 ELSE 0 END) as left`,
        ])
            .where(`student.createdAt >= NOW() - INTERVAL '6 months'`)
            .groupBy(`TO_CHAR(student.createdAt, 'YYYY-MM')`)
            .orderBy(`TO_CHAR(student.createdAt, 'YYYY-MM')`, 'ASC')
            .getRawMany();
        return stats.map(s => ({
            month: s.month,
            total: parseInt(s.total),
            left: parseInt(s.left),
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map