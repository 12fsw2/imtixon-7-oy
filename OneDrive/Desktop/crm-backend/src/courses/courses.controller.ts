import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Yangi kurs yaratish' })
  async create(@Body() dto: CreateCourseDto) {
    const data = await this.coursesService.create(dto);
    return createApiResponse('Kurs yaratildi', data, 201);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha kurslar' })
  async findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kursni ID bo\'yicha olish' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.coursesService.findOne(id);
    return createApiResponse('Kurs topildi', data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Kursni yangilash' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseDto) {
    const data = await this.coursesService.update(id, dto);
    return createApiResponse('Kurs yangilandi', data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kursni o\'chirish' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.coursesService.remove(id);
  }
}
