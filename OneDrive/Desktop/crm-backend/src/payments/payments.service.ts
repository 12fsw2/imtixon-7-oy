import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, PaymentQueryDto, UpdatePaymentDto } from './dto/payment.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';
import { PaymentStatus } from '../common/enums/task.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(dto: CreatePaymentDto, cashierId: string): Promise<Payment> {
    const status = dto.paidAmount >= dto.amount
      ? PaymentStatus.PAID
      : dto.paidAmount > 0
      ? PaymentStatus.PARTIAL
      : PaymentStatus.PENDING;

    const payment = this.paymentRepository.create({
      ...dto,
      cashierId,
      status,
      paidAt: dto.paidAmount > 0 ? new Date() : null,
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(query: PaymentQueryDto) {
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

    if (status) qb.andWhere('payment.status = :status', { status });
    if (studentId) qb.andWhere('payment.studentId = :studentId', { studentId });
    if (groupId) qb.andWhere('payment.groupId = :groupId', { groupId });
    if (month) qb.andWhere('payment.month = :month', { month });

    const allowedSort = ['createdAt', 'amount', 'paidAt'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`payment.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('payment.group', 'group')
      .leftJoin('payment.cashier', 'cashier')
      .addSelect(['cashier.id', 'cashier.firstName', 'cashier.lastName'])
      .where('payment.id = :id', { id })
      .getOne();

    if (!payment) throw new NotFoundException(`To'lov topilmadi`);
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);

    if (dto.paidAmount !== undefined || dto.amount !== undefined) {
      const amount = dto.amount ?? payment.amount;
      const paidAmount = dto.paidAmount ?? payment.paidAmount;
      payment.status = paidAmount >= amount
        ? PaymentStatus.PAID
        : paidAmount > 0
        ? PaymentStatus.PARTIAL
        : PaymentStatus.PENDING;
    }

    return this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  async getStatistics(month?: string) {
    const qb = this.paymentRepository.createQueryBuilder('payment');
    if (month) qb.where('payment.month = :month', { month });

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
}
