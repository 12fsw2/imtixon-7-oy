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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("./entities/department.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
const user_entity_1 = require("../users/entities/user.entity");
let DepartmentsService = class DepartmentsService {
    constructor(departmentRepository, userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }
    async create(createDepartmentDto) {
        const existing = await this.departmentRepository.findOne({
            where: { name: createDepartmentDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Department with this name already exists');
        }
        const department = this.departmentRepository.create(createDepartmentDto);
        return this.departmentRepository.save(department);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const qb = this.departmentRepository
            .createQueryBuilder('department')
            .loadRelationCountAndMap('department.employeeCount', 'department.employees')
            .loadRelationCountAndMap('department.taskCount', 'department.tasks');
        if (search) {
            qb.andWhere('(LOWER(department.name) LIKE :search OR LOWER(department.description) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (isActive !== undefined) {
            qb.andWhere('department.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        const allowedSortFields = ['createdAt', 'name'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        qb.orderBy(`department.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const department = await this.departmentRepository
            .createQueryBuilder('department')
            .leftJoinAndSelect('department.employees', 'employee')
            .select([
            'department.id',
            'department.name',
            'department.description',
            'department.isActive',
            'department.createdAt',
            'department.updatedAt',
            'employee.id',
            'employee.firstName',
            'employee.lastName',
            'employee.email',
            'employee.role',
            'employee.position',
            'employee.isActive',
        ])
            .where('department.id = :id', { id })
            .getOne();
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }
    async update(id, updateDepartmentDto) {
        const department = await this.findOne(id);
        if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
            const existing = await this.departmentRepository.findOne({
                where: { name: updateDepartmentDto.name },
            });
            if (existing) {
                throw new common_1.ConflictException('Department name already in use');
            }
        }
        Object.assign(department, updateDepartmentDto);
        return this.departmentRepository.save(department);
    }
    async remove(id) {
        const department = await this.findOne(id);
        await this.userRepository
            .createQueryBuilder()
            .update(user_entity_1.User)
            .set({ departmentId: null })
            .where('departmentId = :id', { id })
            .execute();
        await this.departmentRepository.remove(department);
    }
    async assignEmployee(id, assignEmployeeDto) {
        const department = await this.departmentRepository.findOne({ where: { id } });
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        const user = await this.userRepository.findOne({
            where: { id: assignEmployeeDto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${assignEmployeeDto.userId} not found`);
        }
        user.departmentId = id;
        return this.userRepository.save(user);
    }
    async removeEmployee(departmentId, userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.departmentId !== departmentId) {
            throw new common_1.ConflictException('User does not belong to this department');
        }
        user.departmentId = null;
        return this.userRepository.save(user);
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map