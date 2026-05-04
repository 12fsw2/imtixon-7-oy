import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Department } from '../departments/entities/department.entity';
export declare class ReportsService {
    private readonly userRepository;
    private readonly taskRepository;
    private readonly departmentRepository;
    constructor(userRepository: Repository<User>, taskRepository: Repository<Task>, departmentRepository: Repository<Department>);
    getDashboard(): Promise<{
        users: {
            total: number;
            active: number;
            admins: number;
            employees: number;
            newThisMonth: number;
        };
        tasks: {
            total: number;
            todo: number;
            inProgress: number;
            done: number;
            overdue: number;
            createdThisMonth: number;
            completedThisMonth: number;
        };
        departments: {
            total: number;
            active: number;
            list: Department[];
        };
        recentTasks: Task[];
        topPerformers: any[];
    }>;
    private getUserStats;
    private getTaskStats;
    private getDepartmentStats;
    private getRecentTasks;
    private getTopPerformers;
    getActivityReport(query: {
        startDate?: string;
        endDate?: string;
        departmentId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Task[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDepartmentReport(departmentId: string): Promise<{
        department: Department;
        taskSummary: {
            total: number;
            done: number;
            inProgress: number;
            todo: number;
        };
    }>;
}
