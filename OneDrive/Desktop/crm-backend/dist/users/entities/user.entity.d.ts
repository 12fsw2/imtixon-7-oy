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
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
