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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
const role_enum_1 = require("../common/enums/role.enum");
const task_enum_1 = require("../common/enums/task.enum");
let TasksService = class TasksService {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    async create(createTaskDto, currentUser) {
        const task = this.taskRepository.create({
            ...createTaskDto,
            createdById: currentUser.id,
        });
        return this.taskRepository.save(task);
    }
    async findAll(query, currentUser) {
        const { page = 1, limit = 10, search, status, priority, assigneeId, departmentId, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
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
        if (currentUser.role === role_enum_1.Role.EMPLOYEE) {
            qb.andWhere('task.assigneeId = :userId', { userId: currentUser.id });
        }
        if (search) {
            qb.andWhere('(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)', { search: `%${search.toLowerCase()}%` });
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
        qb.orderBy(`task.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id, currentUser) {
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
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        if (currentUser.role === role_enum_1.Role.EMPLOYEE && task.assigneeId !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only access your own tasks');
        }
        return task;
    }
    async update(id, updateTaskDto, currentUser) {
        const task = await this.findOne(id, currentUser);
        if (currentUser.role === role_enum_1.Role.EMPLOYEE) {
            throw new common_1.ForbiddenException('Employees cannot edit task details');
        }
        Object.assign(task, updateTaskDto);
        return this.taskRepository.save(task);
    }
    async updateStatus(id, updateStatusDto, currentUser) {
        const task = await this.findOne(id, currentUser);
        task.status = updateStatusDto.status;
        if (updateStatusDto.status === task_enum_1.TaskStatus.DONE) {
            task.completedAt = new Date();
        }
        return this.taskRepository.save(task);
    }
    async remove(id, currentUser) {
        if (currentUser.role === role_enum_1.Role.EMPLOYEE) {
            throw new common_1.ForbiddenException('Employees cannot delete tasks');
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map