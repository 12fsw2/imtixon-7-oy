import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Department } from '../departments/entities/department.entity';
import { Role } from '../common/enums/role.enum';
import { TaskStatus } from '../common/enums/task.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async getDashboard() {
    const [userStats, taskStats, departmentStats, recentTasks, topPerformers] =
      await Promise.all([
        this.getUserStats(),
        this.getTaskStats(),
        this.getDepartmentStats(),
        this.getRecentTasks(5),
        this.getTopPerformers(5),
      ]);

    return {
      users: userStats,
      tasks: taskStats,
      departments: departmentStats,
      recentTasks,
      topPerformers,
    };
  }

  private async getUserStats() {
    const stats = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'COUNT(*) as total',
        `SUM(CASE WHEN user.isActive = true THEN 1 ELSE 0 END) as active`,
        `SUM(CASE WHEN user.role = '${Role.ADMIN}' THEN 1 ELSE 0 END) as admins`,
        `SUM(CASE WHEN user.role = '${Role.EMPLOYEE}' THEN 1 ELSE 0 END) as employees`,
        `SUM(CASE WHEN user.createdAt >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as newThisMonth`,
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      admins: parseInt(stats.admins),
      employees: parseInt(stats.employees),
      newThisMonth: parseInt(stats.newthismonth),
    };
  }

  private async getTaskStats() {
    const stats = await this.taskRepository
      .createQueryBuilder('task')
      .select([
        'COUNT(*) as total',
        `SUM(CASE WHEN task.status = '${TaskStatus.TODO}' THEN 1 ELSE 0 END) as todo`,
        `SUM(CASE WHEN task.status = '${TaskStatus.IN_PROGRESS}' THEN 1 ELSE 0 END) as inProgress`,
        `SUM(CASE WHEN task.status = '${TaskStatus.DONE}' THEN 1 ELSE 0 END) as done`,
        `SUM(CASE WHEN task.dueDate < NOW() AND task.status NOT IN ('DONE', 'CANCELLED') THEN 1 ELSE 0 END) as overdue`,
        `SUM(CASE WHEN task.createdAt >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as createdThisMonth`,
        `SUM(CASE WHEN task.completedAt >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as completedThisMonth`,
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      todo: parseInt(stats.todo),
      inProgress: parseInt(stats.inprogress),
      done: parseInt(stats.done),
      overdue: parseInt(stats.overdue),
      createdThisMonth: parseInt(stats.createdthismonth),
      completedThisMonth: parseInt(stats.completedthismonth),
    };
  }

  private async getDepartmentStats() {
    const stats = await this.departmentRepository
      .createQueryBuilder('dept')
      .loadRelationCountAndMap('dept.employeeCount', 'dept.employees')
      .loadRelationCountAndMap('dept.taskCount', 'dept.tasks')
      .select(['dept.id', 'dept.name', 'dept.isActive'])
      .getMany();

    return {
      total: stats.length,
      active: stats.filter((d: any) => d.isActive).length,
      list: stats,
    };
  }

  private async getRecentTasks(limit: number) {
    return this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.assignee', 'assignee')
      .addSelect(['assignee.id', 'assignee.firstName', 'assignee.lastName'])
      .orderBy('task.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  private async getTopPerformers(limit: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.assignedTasks', 'task', `task.status = '${TaskStatus.DONE}'`)
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'COUNT(task.id) as completedTasks',
      ])
      .where('user.role = :role', { role: Role.EMPLOYEE })
      .groupBy('user.id')
      .orderBy('completedTasks', 'DESC')
      .take(limit)
      .getRawMany();
  }

  async getActivityReport(query: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }) {
    const { startDate, endDate, departmentId, page = 1, limit = 20 } = query;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.assignee', 'assignee')
      .leftJoin('task.department', 'department')
      .addSelect([
        'assignee.id',
        'assignee.firstName',
        'assignee.lastName',
        'department.id',
        'department.name',
      ]);

    if (startDate) {
      qb.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      qb.andWhere('task.createdAt <= :endDate', { endDate: new Date(endDate) });
    }
    if (departmentId) {
      qb.andWhere('task.departmentId = :departmentId', { departmentId });
    }

    qb.orderBy('task.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDepartmentReport(departmentId: string) {
    const department = await this.departmentRepository
      .createQueryBuilder('dept')
      .leftJoin('dept.employees', 'employee')
      .leftJoin('dept.tasks', 'task')
      .addSelect([
        'employee.id',
        'employee.firstName',
        'employee.lastName',
        'employee.role',
        'task.id',
        'task.title',
        'task.status',
        'task.priority',
      ])
      .where('dept.id = :departmentId', { departmentId })
      .getOne();

    if (!department) return null;

    const taskStats = await this.taskRepository
      .createQueryBuilder('task')
      .select([
        `SUM(CASE WHEN task.status = '${TaskStatus.DONE}' THEN 1 ELSE 0 END) as done`,
        `SUM(CASE WHEN task.status = '${TaskStatus.IN_PROGRESS}' THEN 1 ELSE 0 END) as inProgress`,
        `SUM(CASE WHEN task.status = '${TaskStatus.TODO}' THEN 1 ELSE 0 END) as todo`,
        'COUNT(*) as total',
      ])
      .where('task.departmentId = :departmentId', { departmentId })
      .getRawOne();

    return {
      department,
      taskSummary: {
        total: parseInt(taskStats.total),
        done: parseInt(taskStats.done),
        inProgress: parseInt(taskStats.inprogress),
        todo: parseInt(taskStats.todo),
      },
    };
  }
}
