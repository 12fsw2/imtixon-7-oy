import { TaskPriority, TaskStatus } from '../../common/enums/task.enum';
export declare class Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    assigneeId: string;
    assignee: any;
    createdById: string;
    createdBy: any;
    departmentId: string;
    department: any;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
