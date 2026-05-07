import { Role } from '../../common/enums/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    position?: string;
    role?: Role;
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export declare class AssignRoleDto {
    role: Role;
}
export declare class UserQueryDto extends PaginationQueryDto {
    role?: Role;
    isActive?: string;
}
export {};
