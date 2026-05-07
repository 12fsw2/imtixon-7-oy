import { GradesService } from './grades.service';
import { CreateGradeDto, GradeQueryDto, UpdateGradeDto } from './dto/grade.dto';
export declare class GradesController {
    private readonly gradesService;
    constructor(gradesService: GradesService);
    create(dto: CreateGradeDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/grade.entity").Grade>>;
    findAll(query: GradeQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/grade.entity").Grade>>;
    getStudentReport(studentId: string, groupId?: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        total: number;
        avgScore: number;
        maxScore: number;
        minScore: number;
        grades: import("./entities/grade.entity").Grade[];
    }>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/grade.entity").Grade>>;
    update(id: string, dto: UpdateGradeDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/grade.entity").Grade>>;
    remove(id: string): Promise<void>;
}
