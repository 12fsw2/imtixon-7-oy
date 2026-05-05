import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import {
  AssignEmployeeDto,
  CreateDepartmentDto,
  DepartmentQueryDto,
  UpdateDepartmentDto,
} from './dto/department.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new department' })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const department = await this.departmentsService.create(createDepartmentDto);
    return createApiResponse('Department created successfully', department, 201);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get all departments with pagination' })
  async findAll(@Query() query: DepartmentQueryDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get department by ID with employees' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const department = await this.departmentsService.findOne(id);
    return createApiResponse('Department retrieved', department);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update department' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentsService.update(id, updateDepartmentDto);
    return createApiResponse('Department updated successfully', department);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department (Super Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.departmentsService.remove(id);
  }

  @Post(':id/employees')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Assign employee to department' })
  async assignEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignEmployeeDto: AssignEmployeeDto,
  ) {
    const user = await this.departmentsService.assignEmployee(id, assignEmployeeDto);
    return createApiResponse('Employee assigned to department', user);
  }

  @Delete(':id/employees/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Remove employee from department' })
  async removeEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const user = await this.departmentsService.removeEmployee(id, userId);
    return createApiResponse('Employee removed from department', user);
  }
}