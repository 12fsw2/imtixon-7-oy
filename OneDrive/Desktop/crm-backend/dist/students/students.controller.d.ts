import { StudentsService } from './students.service';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(dto: CreateStudentDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/student.entity").Student>>;
    findAll(query: StudentQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/student.entity").Student>>;
    getStatistics(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        graduated: number;
        newThisMonth: number;
    }>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/student.entity").Student>>;
    update(id: string, dto: UpdateStudentDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/student.entity").Student>>;
    remove(id: string): Promise<void>;
}
