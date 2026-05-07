import { CourseStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateCourseDto {
    name: string;
    description?: string;
    price: number;
    duration?: number;
    status?: CourseStatus;
}
declare const UpdateCourseDto_base: import("@nestjs/common").Type<Partial<CreateCourseDto>>;
export declare class UpdateCourseDto extends UpdateCourseDto_base {
}
export declare class CourseQueryDto extends PaginationQueryDto {
    status?: CourseStatus;
}
export {};
