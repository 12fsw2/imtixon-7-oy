import { AttendanceStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateAttendanceDto {
    studentId: string;
    groupId: string;
    date: string;
    status?: AttendanceStatus;
    note?: string;
}
export declare class BulkAttendanceDto {
    groupId: string;
    date: string;
    records: {
        studentId: string;
        status: AttendanceStatus;
        note?: string;
    }[];
}
declare const UpdateAttendanceDto_base: import("@nestjs/common").Type<Partial<CreateAttendanceDto>>;
export declare class UpdateAttendanceDto extends UpdateAttendanceDto_base {
}
export declare class AttendanceQueryDto extends PaginationQueryDto {
    status?: AttendanceStatus;
    studentId?: string;
    groupId?: string;
    startDate?: string;
    endDate?: string;
}
export {};
