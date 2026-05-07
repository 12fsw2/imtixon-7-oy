import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        students: {
            total: number;
            active: number;
            leftThisMonth: number;
            newThisMonth: number;
        };
        teachers: {
            total: number;
        };
        groups: {
            total: number;
            active: number;
            completed: number;
        };
        payments: {
            totalPaid: number;
            totalAmount: number;
            thisMonthPaid: number;
            totalDebt: number;
        };
        monthlyStats: {
            month: any;
            total: number;
            left: number;
        }[];
    }>>;
}
