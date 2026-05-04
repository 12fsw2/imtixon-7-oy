import { Role } from '../../common/enums/role.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    position: string;
    role: Role;
    isActive: boolean;
    departmentId: string;
    department: any;
    assignedTasks: any[];
    createdTasks: any[];
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
