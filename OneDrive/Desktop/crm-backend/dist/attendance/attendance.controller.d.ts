import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, BulkAttendanceDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    create(dto: CreateAttendanceDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/attendance.entity").Attendance>>;
    bulkCreate(dto: BulkAttendanceDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/attendance.entity").Attendance[]>>;
    findAll(query: AttendanceQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/attendance.entity").Attendance>>;
    getGroupReport(groupId: string, startDate?: string, endDate?: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any[]>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/attendance.entity").Attendance>>;
    update(id: string, dto: UpdateAttendanceDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/attendance.entity").Attendance>>;
    remove(id: string): Promise<void>;
}
