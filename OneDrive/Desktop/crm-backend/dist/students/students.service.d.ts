import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
export declare class StudentsService {
    private readonly studentRepository;
    constructor(studentRepository: Repository<Student>);
    create(dto: CreateStudentDto): Promise<Student>;
    findAll(query: StudentQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Student>>;
    findOne(id: string): Promise<Student>;
    update(id: string, dto: UpdateStudentDto): Promise<Student>;
    remove(id: string): Promise<void>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        graduated: number;
        newThisMonth: number;
    }>;
}
