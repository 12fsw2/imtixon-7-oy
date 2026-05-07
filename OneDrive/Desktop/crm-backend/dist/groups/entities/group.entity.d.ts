import { GroupStatus } from '../../common/enums/task.enum';
export declare class Group {
    id: string;
    name: string;
    courseId: string;
    course: any;
    teacherId: string;
    teacher: any;
    status: GroupStatus;
    startDate: Date;
    endDate: Date;
    schedule: string;
    room: string;
    maxStudents: number;
    groupStudents: any[];
    attendances: any[];
    grades: any[];
    createdAt: Date;
    updatedAt: Date;
}
