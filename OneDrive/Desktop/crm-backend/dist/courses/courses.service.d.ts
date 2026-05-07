import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesService {
    private readonly courseRepository;
    constructor(courseRepository: Repository<Course>);
    create(dto: CreateCourseDto): Promise<Course>;
    findAll(query: CourseQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Course>>;
    findOne(id: string): Promise<Course>;
    update(id: string, dto: UpdateCourseDto): Promise<Course>;
    remove(id: string): Promise<void>;
}
