import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentQueryDto, UpdatePaymentDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/payment.entity").Payment>>;
    findAll(query: PaymentQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/payment.entity").Payment>>;
    getStatistics(month?: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
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
    }>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/payment.entity").Payment>>;
    update(id: string, dto: UpdatePaymentDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/payment.entity").Payment>>;
    remove(id: string): Promise<void>;
}
