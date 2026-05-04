import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
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
            list: import("../departments/entities/department.entity").Department[];
        };
        recentTasks: import("../tasks/entities/task.entity").Task[];
        topPerformers: any[];
    }>>;
    getActivityReport(startDate?: string, endDate?: string, departmentId?: string, page?: number, limit?: number): Promise<{
        data: import("../tasks/entities/task.entity").Task[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDepartmentReport(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        department: import("../departments/entities/department.entity").Department;
        taskSummary: {
            total: number;
            done: number;
            inProgress: number;
            todo: number;
        };
    }>>;
}
