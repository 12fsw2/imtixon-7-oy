import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto, GradeQueryDto, UpdateGradeDto } from './dto/grade.dto';
export declare class GradesService {
    private readonly gradeRepository;
    constructor(gradeRepository: Repository<Grade>);
    create(dto: CreateGradeDto, gradedById: string): Promise<Grade>;
    findAll(query: GradeQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Grade>>;
    findOne(id: string): Promise<Grade>;
    update(id: string, dto: UpdateGradeDto): Promise<Grade>;
    remove(id: string): Promise<void>;
    getStudentGradeReport(studentId: string, groupId?: string): Promise<{
        total: number;
        avgScore: number;
        maxScore: number;
        minScore: number;
        grades: Grade[];
    }>;
}
