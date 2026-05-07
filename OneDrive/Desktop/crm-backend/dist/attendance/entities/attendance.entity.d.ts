import { AttendanceStatus } from '../../common/enums/task.enum';
export declare class Attendance {
    id: string;
    studentId: string;
    student: any;
    groupId: string;
    group: any;
    date: Date;
    status: AttendanceStatus;
    note: string;
    markedById: string;
    markedBy: any;
    createdAt: Date;
    updatedAt: Date;
}
