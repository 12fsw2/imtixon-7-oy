import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Group } from '../groups/entities/group.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboard() {
    const [studentStats, teacherCount, groupStats, paymentStats, monthlyStats] =
      await Promise.all([
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

  private async getStudentStats() {
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

  private async getTeacherCount() {
    const count = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'TEACHER' })
      .andWhere('user.isActive = true')
      .getCount();
    return { total: count };
  }

  private async getGroupStats() {
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

  private async getPaymentStats() {
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

  private async getMonthlyStats() {
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
}