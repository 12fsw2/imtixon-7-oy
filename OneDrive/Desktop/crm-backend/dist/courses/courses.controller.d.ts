import { CoursesService } from './courses.service';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(dto: CreateCourseDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/course.entity").Course>>;
    findAll(query: CourseQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/course.entity").Course>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/course.entity").Course>>;
    update(id: string, dto: UpdateCourseDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/course.entity").Course>>;
    remove(id: string): Promise<void>;
}
