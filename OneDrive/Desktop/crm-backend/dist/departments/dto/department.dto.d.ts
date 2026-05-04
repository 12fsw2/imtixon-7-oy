import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateDepartmentDto {
    name: string;
    description?: string;
}
declare const UpdateDepartmentDto_base: import("@nestjs/common").Type<Partial<CreateDepartmentDto>>;
export declare class UpdateDepartmentDto extends UpdateDepartmentDto_base {
    isActive?: boolean;
}
export declare class AssignEmployeeDto {
    userId: string;
}
export declare class DepartmentQueryDto extends PaginationQueryDto {
    isActive?: string;
}
export {};
