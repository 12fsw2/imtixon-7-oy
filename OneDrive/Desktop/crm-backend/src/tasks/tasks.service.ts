import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import {
  CreateTaskDto,
  TaskQueryDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from './dto/task.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';
import { Role } from '../common/enums/role.enum';
import { TaskStatus } from '../common/enums/task.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, currentUser: any): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: currentUser.id,
    });
    return this.taskRepository.save(task);
  }

  async findAll(query: TaskQueryDto, currentUser: any) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      assigneeId,
      departmentId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.assignee', 'assignee')
      .leftJoin('task.createdBy', 'createdBy')
      .leftJoin('task.department', 'department')
      .addSelect([
        'assignee.id',
        'assignee.firstName',
        'assignee.lastName',
        'assignee.email',
        'createdBy.id',
        'createdBy.firstName',
        'createdBy.lastName',
        'department.id',
        'department.name',
      ]);

    // Employees can only see their own tasks
    if (currentUser.role === Role.EMPLOYEE) {
      qb.andWhere('task.assigneeId = :userId', { userId: currentUser.id });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    if (priority) {
      qb.andWhere('task.priority = :priority', { priority });
    }

    if (assigneeId) {
      qb.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (departmentId) {
      qb.andWhere('task.departmentId = :departmentId', { departmentId });
    }

    const allowedSortFields = ['createdAt', 'title', 'status', 'priority', 'dueDate'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`task.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, currentUser: any): Promise<Task> {
    const task = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.assignee', 'assignee')
      .leftJoin('task.createdBy', 'createdBy')
      .leftJoin('task.department', 'department')
      .addSelect([
        'assignee.id',
        'assignee.firstName',
        'assignee.lastName',
        'assignee.email',
        'createdBy.id',
        'createdBy.firstName',
        'createdBy.lastName',
        'department.id',
        'department.name',
      ])
      .where('task.id = :id', { id })
      .getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Employees can only see their own tasks
    if (currentUser.role === Role.EMPLOYEE && task.assigneeId !== currentUser.id) {
      throw new ForbiddenException('You can only access your own tasks');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, currentUser: any): Promise<Task> {
    const task = await this.findOne(id, currentUser);

    if (currentUser.role === Role.EMPLOYEE) {
      throw new ForbiddenException('Employees cannot edit task details');
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto, currentUser: any): Promise<Task> {
    const task = await this.findOne(id, currentUser);

    task.status = updateStatusDto.status;
    if (updateStatusDto.status === TaskStatus.DONE) {
      task.completedAt = new Date();
    }

    return this.taskRepository.save(task);
  }

  async remove(id: string, currentUser: any): Promise<void> {
    if (currentUser.role === Role.EMPLOYEE) {
      throw new ForbiddenException('Employees cannot delete tasks');
    }
    const task = await this.findOne(id, currentUser);
    await this.taskRepository.remove(task);
  }

  async getTaskStatistics() {
    const stats = await this.taskRepository
      .createQueryBuilder('task')
      .select([
        'COUNT(*) as total',
        `SUM(CASE WHEN task.status = 'TODO' THEN 1 ELSE 0 END) as todo`,
        `SUM(CASE WHEN task.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress`,
        `SUM(CASE WHEN task.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReview`,
        `SUM(CASE WHEN task.status = 'DONE' THEN 1 ELSE 0 END) as done`,
        `SUM(CASE WHEN task.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled`,
        `SUM(CASE WHEN task.priority = 'URGENT' THEN 1 ELSE 0 END) as urgent`,
        `SUM(CASE WHEN task.dueDate < NOW() AND task.status NOT IN ('DONE', 'CANCELLED') THEN 1 ELSE 0 END) as overdue`,
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      byStatus: {
        todo: parseInt(stats.todo),
        inProgress: parseInt(stats.inprogress),
        inReview: parseInt(stats.inreview),
        done: parseInt(stats.done),
        cancelled: parseInt(stats.cancelled),
      },
      urgent: parseInt(stats.urgent),
      overdue: parseInt(stats.overdue),
    };
  }
}
