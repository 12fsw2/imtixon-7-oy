import { GroupStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateGroupDto {
    name: string;
    courseId?: string;
    teacherId?: string;
    startDate?: string;
    endDate?: string;
    schedule?: string;
    room?: string;
    maxStudents?: number;
}
declare const UpdateGroupDto_base: import("@nestjs/common").Type<Partial<CreateGroupDto>>;
export declare class UpdateGroupDto extends UpdateGroupDto_base {
    status?: GroupStatus;
}
export declare class AddStudentToGroupDto {
    studentId: string;
}
export declare class GroupQueryDto extends PaginationQueryDto {
    status?: GroupStatus;
    courseId?: string;
    teacherId?: string;
}
export {};
