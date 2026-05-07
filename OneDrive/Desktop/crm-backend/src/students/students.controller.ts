import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Yangi talaba qo\'shish' })
  async create(@Body() dto: CreateStudentDto) {
    const data = await this.studentsService.create(dto);
    return createApiResponse('Talaba qo\'shildi', data, 201);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Barcha talabalar' })
  async findAll(@Query() query: StudentQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Talabalar statistikasi' })
  async getStatistics() {
    const data = await this.studentsService.getStatistics();
    return createApiResponse('Statistika', data);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Talabani ID bo\'yicha olish' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.studentsService.findOne(id);
    return createApiResponse('Talaba topildi', data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Talabani yangilash' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto) {
    const data = await this.studentsService.update(id, dto);
    return createApiResponse('Talaba yangilandi', data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Talabani o\'chirish' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.studentsService.remove(id);
  }
}
