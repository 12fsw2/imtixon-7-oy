import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Group } from '../groups/entities/group.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';
export declare class ReportsService {
    private readonly studentRepository;
    private readonly groupRepository;
    private readonly paymentRepository;
    private readonly attendanceRepository;
    private readonly userRepository;
    constructor(studentRepository: Repository<Student>, groupRepository: Repository<Group>, paymentRepository: Repository<Payment>, attendanceRepository: Repository<Attendance>, userRepository: Repository<User>);
    getDashboard(): Promise<{
        students: {
            total: number;
            active: number;
            leftThisMonth: number;
            newThisMonth: number;
        };
        teachers: {
            total: number;
        };
        groups: {
            total: number;
            active: number;
            completed: number;
        };
        payments: {
            totalPaid: number;
            totalAmount: number;
            thisMonthPaid: number;
            totalDebt: number;
        };
        monthlyStats: {
            month: any;
            total: number;
            left: number;
        }[];
    }>;
    private getStudentStats;
    private getTeacherCount;
    private getGroupStats;
    private getPaymentStats;
    private getMonthlyStats;
}
