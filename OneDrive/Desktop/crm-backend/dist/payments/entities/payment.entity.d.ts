import { PaymentMethod, PaymentStatus } from '../../common/enums/task.enum';
export declare class Payment {
    id: string;
    studentId: string;
    student: any;
    groupId: string;
    group: any;
    amount: number;
    discount: number;
    paidAmount: number;
    status: PaymentStatus;
    method: PaymentMethod;
    month: string;
    note: string;
    cashierId: string;
    cashier: any;
    paidAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
