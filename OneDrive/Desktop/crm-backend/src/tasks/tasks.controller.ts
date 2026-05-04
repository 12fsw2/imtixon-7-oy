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
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  TaskQueryDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from './dto/task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create new task (Admin+)' })
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
    const task = await this.tasksService.create(createTaskDto, user);
    return createApiResponse('Task created successfully', task, 201);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks (Employees see only their tasks)' })
  async findAll(@Query() query: TaskQueryDto, @CurrentUser() user: any) {
    return this.tasksService.findAll(query, user);
  }

  @Get('statistics')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get task statistics' })
  async getStatistics() {
    const stats = await this.tasksService.getTaskStatistics();
    return createApiResponse('Task statistics retrieved', stats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const task = await this.tasksService.findOne(id, user);
    return createApiResponse('Task retrieved', task);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update task (Admin+)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    const task = await this.tasksService.update(id, updateTaskDto, user);
    return createApiResponse('Task updated successfully', task);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status (all roles)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: any,
  ) {
    const task = await this.tasksService.updateStatus(id, updateStatusDto, user);
    return createApiResponse('Task status updated', task);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task (Admin+)' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    await this.tasksService.remove(id, user);
  }
}
