import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    const data = await this.reportsService.getDashboard();
    return createApiResponse('Dashboard data retrieved', data);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get activity report with filters' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getActivityReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.reportsService.getActivityReport({
      startDate,
      endDate,
      departmentId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return data;
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get detailed department report' })
  async getDepartmentReport(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.reportsService.getDepartmentReport(id);
    return createApiResponse('Department report retrieved', data);
  }
}