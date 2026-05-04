import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/task.entity").Task>>;
    findAll(query: TaskQueryDto, user: any): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/task.entity").Task>>;
    getStatistics(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        total: number;
        byStatus: {
            todo: number;
            inProgress: number;
            inReview: number;
            done: number;
            cancelled: number;
        };
        urgent: number;
        overdue: number;
    }>>;
    findOne(id: string, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/task.entity").Task>>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/task.entity").Task>>;
    updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto, user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/task.entity").Task>>;
    remove(id: string, user: any): Promise<void>;
}
