import { StudentStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateStudentDto {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    parentPhone?: string;
    address?: string;
    birthDate?: string;
    note?: string;
}
declare const UpdateStudentDto_base: import("@nestjs/common").Type<Partial<CreateStudentDto>>;
export declare class UpdateStudentDto extends UpdateStudentDto_base {
    status?: StudentStatus;
}
export declare class StudentQueryDto extends PaginationQueryDto {
    status?: StudentStatus;
    groupId?: string;
}
export {};
