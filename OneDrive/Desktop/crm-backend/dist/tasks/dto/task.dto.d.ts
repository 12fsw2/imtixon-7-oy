import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    departmentId?: string;
}
declare const UpdateTaskDto_base: import("@nestjs/common").Type<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
}
export declare class UpdateTaskStatusDto {
    status: TaskStatus;
}
export declare class TaskQueryDto extends PaginationQueryDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    departmentId?: string;
}
export {};
