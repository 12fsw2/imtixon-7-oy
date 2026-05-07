import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CourseStatus } from '../../common/enums/task.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Backend' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Backend development with NestJS' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class CourseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
