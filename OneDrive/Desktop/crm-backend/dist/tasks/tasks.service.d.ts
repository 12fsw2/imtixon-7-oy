import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
export declare class TasksService {
    private readonly taskRepository;
    constructor(taskRepository: Repository<Task>);
    create(createTaskDto: CreateTaskDto, currentUser: any): Promise<Task>;
    findAll(query: TaskQueryDto, currentUser: any): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Task>>;
    findOne(id: string, currentUser: any): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, currentUser: any): Promise<Task>;
    updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto, currentUser: any): Promise<Task>;
    remove(id: string, currentUser: any): Promise<void>;
    getTaskStatistics(): Promise<{
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
    }>;
}
