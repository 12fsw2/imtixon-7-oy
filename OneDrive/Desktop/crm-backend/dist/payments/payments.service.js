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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
const task_enum_1 = require("../common/enums/task.enum");
let PaymentsService = class PaymentsService {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async create(dto, cashierId) {
        const status = dto.paidAmount >= dto.amount
            ? task_enum_1.PaymentStatus.PAID
            : dto.paidAmount > 0
                ? task_enum_1.PaymentStatus.PARTIAL
                : task_enum_1.PaymentStatus.PENDING;
        const payment = this.paymentRepository.create({
            ...dto,
            cashierId,
            status,
            paidAt: dto.paidAmount > 0 ? new Date() : null,
        });
        return this.paymentRepository.save(payment);
    }
    async findAll(query) {
        const { page = 1, limit = 10, status, studentId, groupId, month, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const qb = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoin('payment.student', 'student')
            .leftJoin('payment.group', 'group')
            .leftJoin('payment.cashier', 'cashier')
            .addSelect([
            'student.id', 'student.firstName', 'student.lastName', 'student.phone',
            'group.id', 'group.name',
            'cashier.id', 'cashier.firstName', 'cashier.lastName',
        ]);
        if (status)
            qb.andWhere('payment.status = :status', { status });
        if (studentId)
            qb.andWhere('payment.studentId = :studentId', { studentId });
        if (groupId)
            qb.andWhere('payment.groupId = :groupId', { groupId });
        if (month)
            qb.andWhere('payment.month = :month', { month });
        const allowedSort = ['createdAt', 'amount', 'paidAt'];
        const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
        qb.orderBy(`payment.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const payment = await this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.student', 'student')
            .leftJoinAndSelect('payment.group', 'group')
            .leftJoin('payment.cashier', 'cashier')
            .addSelect(['cashier.id', 'cashier.firstName', 'cashier.lastName'])
            .where('payment.id = :id', { id })
            .getOne();
        if (!payment)
            throw new common_1.NotFoundException(`To'lov topilmadi`);
        return payment;
    }
    async update(id, dto) {
        const payment = await this.findOne(id);
        Object.assign(payment, dto);
        if (dto.paidAmount !== undefined || dto.amount !== undefined) {
            const amount = dto.amount ?? payment.amount;
            const paidAmount = dto.paidAmount ?? payment.paidAmount;
            payment.status = paidAmount >= amount
                ? task_enum_1.PaymentStatus.PAID
                : paidAmount > 0
                    ? task_enum_1.PaymentStatus.PARTIAL
                    : task_enum_1.PaymentStatus.PENDING;
        }
        return this.paymentRepository.save(payment);
    }
    async remove(id) {
        const payment = await this.findOne(id);
        await this.paymentRepository.remove(payment);
    }
    async getStatistics(month) {
        const qb = this.paymentRepository.createQueryBuilder('payment');
        if (month)
            qb.where('payment.month = :month', { month });
        const stats = await qb
            .select([
            'SUM(payment.amount) as totalAmount',
            'SUM(payment.paidAmount) as totalPaid',
            'SUM(payment.discount) as totalDiscount',
            `SUM(CASE WHEN payment.status = 'PAID' THEN 1 ELSE 0 END) as paid`,
            `SUM(CASE WHEN payment.status = 'PARTIAL' THEN 1 ELSE 0 END) as partial`,
            `SUM(CASE WHEN payment.status = 'PENDING' THEN 1 ELSE 0 END) as pending`,
            `SUM(CASE WHEN payment.status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue`,
            'COUNT(*) as total',
        ])
            .getRawOne();
        return {
            total: parseInt(stats.total),
            totalAmount: parseFloat(stats.totalamount) || 0,
            totalPaid: parseFloat(stats.totalpaid) || 0,
            totalDiscount: parseFloat(stats.totaldiscount) || 0,
            debt: (parseFloat(stats.totalamount) || 0) - (parseFloat(stats.totalpaid) || 0),
            byStatus: {
                paid: parseInt(stats.paid),
                partial: parseInt(stats.partial),
                pending: parseInt(stats.pending),
                overdue: parseInt(stats.overdue),
            },
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map