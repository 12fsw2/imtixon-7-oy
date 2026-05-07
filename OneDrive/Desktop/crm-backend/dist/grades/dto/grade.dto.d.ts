import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class CreateGradeDto {
    studentId: string;
    groupId: string;
    score: number;
    topic?: string;
    note?: string;
    date?: string;
}
declare const UpdateGradeDto_base: import("@nestjs/common").Type<Partial<CreateGradeDto>>;
export declare class UpdateGradeDto extends UpdateGradeDto_base {
}
export declare class GradeQueryDto extends PaginationQueryDto {
    studentId?: string;
    groupId?: string;
}
export {};
