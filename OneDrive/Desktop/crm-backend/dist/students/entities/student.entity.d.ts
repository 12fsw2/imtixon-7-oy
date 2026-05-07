import { StudentStatus } from '../../common/enums/task.enum';
export declare class Student {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    parentPhone: string;
    address: string;
    birthDate: Date;
    status: StudentStatus;
    note: string;
    groupStudents: any[];
    payments: any[];
    attendances: any[];
    grades: any[];
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
