import { CourseStatus } from '../../common/enums/task.enum';
export declare class Course {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    status: CourseStatus;
    groups: any[];
    createdAt: Date;
    updatedAt: Date;
}
