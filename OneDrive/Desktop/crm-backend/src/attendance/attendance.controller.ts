import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, BulkAttendanceDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Davomat belgilash' })
  async create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: any) {
    const data = await this.attendanceService.create(dto, user.id);
    return createApiResponse('Davomat belgilandi', data, 201);
  }

  @Post('bulk')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Bir vaqtda ko\'p talaba davomati' })
  async bulkCreate(@Body() dto: BulkAttendanceDto, @CurrentUser() user: any) {
    const data = await this.attendanceService.bulkCreate(dto, user.id);
    return createApiResponse('Davomat belgilandi', data, 201);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Barcha davomat yozuvlari' })
  async findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }

  @Get('report/:groupId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Guruh davomat hisoboti' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getGroupReport(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.attendanceService.getGroupAttendanceReport(groupId, startDate, endDate);
    return createApiResponse('Guruh davomat hisoboti', data);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Davomat yozuvini ID bo\'yicha olish' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.attendanceService.findOne(id);
    return createApiResponse('Davomat topildi', data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Davomatni yangilash' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAttendanceDto) {
    const data = await this.attendanceService.update(id, dto);
    return createApiResponse('Davomat yangilandi', data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Davomat yozuvini o\'chirish' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.attendanceService.remove(id);
  }
}
