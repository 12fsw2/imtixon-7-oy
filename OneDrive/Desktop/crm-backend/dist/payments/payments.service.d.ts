import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, PaymentQueryDto, UpdatePaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    private readonly paymentRepository;
    constructor(paymentRepository: Repository<Payment>);
    create(dto: CreatePaymentDto, cashierId: string): Promise<Payment>;
    findAll(query: PaymentQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Payment>>;
    findOne(id: string): Promise<Payment>;
    update(id: string, dto: UpdatePaymentDto): Promise<Payment>;
    remove(id: string): Promise<void>;
    getStatistics(month?: string): Promise<{
        total: number;
        totalAmount: number;
        totalPaid: number;
        totalDiscount: number;
        debt: number;
        byStatus: {
            paid: number;
            partial: number;
            pending: number;
            overdue: number;
        };
    }>;
}
