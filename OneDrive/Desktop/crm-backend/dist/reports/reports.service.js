"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const department_entity_1 = require("../departments/entities/department.entity");
const role_enum_1 = require("../common/enums/role.enum");
const task_enum_1 = require("../common/enums/task.enum");
let ReportsService = class ReportsService {
    constructor(userRepository, taskRepository, departmentRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.departmentRepository = departmentRepository;
    }
    async getDashboard() {
        const [userStats, taskStats, departmentStats, recentTasks, topPerformers] = await Promise.all([
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
    async getUserStats() {
        const stats = await this.userRepository
            .createQueryBuilder('user')
            .select([
            'COUNT(*) as total',
            `SUM(CASE WHEN user.isActive = true THEN 1 ELSE 0 END) as active`,
            `SUM(CASE WHEN user.role = '${role_enum_1.Role.ADMIN}' THEN 1 ELSE 0 END) as admins`,
            `SUM(CASE WHEN user.role = '${role_enum_1.Role.EMPLOYEE}' THEN 1 ELSE 0 END) as employees`,
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
    async getTaskStats() {
        const stats = await this.taskRepository
            .createQueryBuilder('task')
            .select([
            'COUNT(*) as total',
            `SUM(CASE WHEN task.status = '${task_enum_1.TaskStatus.TODO}' THEN 1 ELSE 0 END) as todo`,
            `SUM(CASE WHEN task.status = '${task_enum_1.TaskStatus.IN_PROGRESS}' THEN 1 ELSE 0 END) as inProgress`,
            `SUM(CASE WHEN task.status = '${task_enum_1.TaskStatus.DONE}' THEN 1 ELSE 0 END) as done`,
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
    async getDepartmentStats() {
        const stats = await this.departmentRepository
            .createQueryBuilder('dept')
            .loadRelationCountAndMap('dept.employeeCount', 'dept.employees')
            .loadRelationCountAndMap('dept.taskCount', 'dept.tasks')
            .select(['dept.id', 'dept.name', 'dept.isActive'])
            .getMany();
        return {
            total: stats.length,
            active: stats.filter((d) => d.isActive).length,
            list: stats,
        };
    }
    async getRecentTasks(limit) {
        return this.taskRepository
            .createQueryBuilder('task')
            .leftJoin('task.assignee', 'assignee')
            .addSelect(['assignee.id', 'assignee.firstName', 'assignee.lastName'])
            .orderBy('task.createdAt', 'DESC')
            .take(limit)
            .getMany();
    }
    async getTopPerformers(limit) {
        return this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.assignedTasks', 'task', `task.status = '${task_enum_1.TaskStatus.DONE}'`)
            .select([
            'user.id',
            'user.firstName',
            'user.lastName',
            'user.email',
            'COUNT(task.id) as completedTasks',
        ])
            .where('user.role = :role', { role: role_enum_1.Role.EMPLOYEE })
            .groupBy('user.id')
            .orderBy('completedTasks', 'DESC')
            .take(limit)
            .getRawMany();
    }
    async getActivityReport(query) {
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
    async getDepartmentReport(departmentId) {
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
        if (!department)
            return null;
        const taskStats = await this.taskRepository
            .createQueryBuilder('task')
            .select([
            `SUM(CASE WHEN task.status = '${task_enum_1.TaskStatus.DONE}' THEN 1 ELSE 0 END) as done`,
            `SUM(CASE WHEN task.status = '${task_enum_1.TaskStatus.IN_PROGRESS}' THEN 1 ELSE 0 END) as inProgress`,
            `SUM(CASE WHEN task.status = '${task_enum_1.TaskStatus.TODO}' THEN 1 ELSE 0 END) as todo`,
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map