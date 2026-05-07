import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty()
  @IsUUID()
  groupId: string;

  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkAttendanceDto {
  @ApiProperty()
  @IsUUID()
  groupId: string;

  @ApiProperty({ example: '2026-05-05' })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: [
      { studentId: 'uuid', status: 'PRESENT' },
    ],
  })
  records: { studentId: string; status: AttendanceStatus; note?: string }[];
}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}

export class AttendanceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
