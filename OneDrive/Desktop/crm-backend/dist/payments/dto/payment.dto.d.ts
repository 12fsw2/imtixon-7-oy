import { PaymentMethod, PaymentStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreatePaymentDto {
    studentId: string;
    groupId?: string;
    amount: number;
    discount?: number;
    paidAmount: number;
    method?: PaymentMethod;
    month?: string;
    note?: string;
}
declare const UpdatePaymentDto_base: import("@nestjs/common").Type<Partial<CreatePaymentDto>>;
export declare class UpdatePaymentDto extends UpdatePaymentDto_base {
    status?: PaymentStatus;
}
export declare class PaymentQueryDto extends PaginationQueryDto {
    status?: PaymentStatus;
    studentId?: string;
    groupId?: string;
    month?: string;
}
export {};
