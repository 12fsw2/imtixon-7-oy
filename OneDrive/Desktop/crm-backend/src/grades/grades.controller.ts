import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto, GradeQueryDto, UpdateGradeDto } from './dto/grade.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Grades')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Baho qo\'yish' })
  async create(@Body() dto: CreateGradeDto, @CurrentUser() user: any) {
    const data = await this.gradesService.create(dto, user.id);
    return createApiResponse('Baho qo\'yildi', data, 201);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Barcha baholar' })
  async findAll(@Query() query: GradeQueryDto) {
    return this.gradesService.findAll(query);
  }

  @Get('report/:studentId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Talaba baho hisoboti' })
  @ApiQuery({ name: 'groupId', required: false })
  async getStudentReport(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query('groupId') groupId?: string,
  ) {
    const data = await this.gradesService.getStudentGradeReport(studentId, groupId);
    return createApiResponse('Talaba baho hisoboti', data);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Bahoni ID bo\'yicha olish' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.gradesService.findOne(id);
    return createApiResponse('Baho topildi', data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Bahoni yangilash' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGradeDto) {
    const data = await this.gradesService.update(id, dto);
    return createApiResponse('Baho yangilandi', data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bahoni o\'chirish' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.gradesService.remove(id);
  }
}
