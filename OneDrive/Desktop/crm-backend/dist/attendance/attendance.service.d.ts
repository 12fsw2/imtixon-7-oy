import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceQueryDto, BulkAttendanceDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
export declare class AttendanceService {
    private readonly attendanceRepository;
    constructor(attendanceRepository: Repository<Attendance>);
    create(dto: CreateAttendanceDto, userId: string): Promise<Attendance>;
    bulkCreate(dto: BulkAttendanceDto, userId: string): Promise<Attendance[]>;
    findAll(query: AttendanceQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Attendance>>;
    findOne(id: string): Promise<Attendance>;
    update(id: string, dto: UpdateAttendanceDto): Promise<Attendance>;
    remove(id: string): Promise<void>;
    getGroupAttendanceReport(groupId: string, startDate?: string, endDate?: string): Promise<any[]>;
}
