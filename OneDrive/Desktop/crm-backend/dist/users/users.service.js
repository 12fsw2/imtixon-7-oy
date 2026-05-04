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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("./entities/user.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
const role_enum_1 = require("../common/enums/role.enum");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.userRepository.save(user);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, role, departmentId, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const qb = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.department', 'department')
            .select([
            'user.id',
            'user.email',
            'user.firstName',
            'user.lastName',
            'user.phone',
            'user.position',
            'user.role',
            'user.isActive',
            'user.departmentId',
            'user.createdAt',
            'user.updatedAt',
            'department.id',
            'department.name',
        ]);
        if (search) {
            qb.andWhere('(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.position) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (role) {
            qb.andWhere('user.role = :role', { role });
        }
        if (departmentId) {
            qb.andWhere('user.departmentId = :departmentId', { departmentId });
        }
        if (isActive !== undefined) {
            qb.andWhere('user.isActive = :isActive', {
                isActive: isActive === 'true',
            });
        }
        const allowedSortFields = ['createdAt', 'firstName', 'lastName', 'email', 'role'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        qb.orderBy(`user.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.department', 'department')
            .select([
            'user.id',
            'user.email',
            'user.firstName',
            'user.lastName',
            'user.phone',
            'user.position',
            'user.role',
            'user.isActive',
            'user.departmentId',
            'user.createdAt',
            'user.updatedAt',
            'department.id',
            'department.name',
        ])
            .where('user.id = :id', { id })
            .getOne();
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existing = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
    async assignRole(id, assignRoleDto) {
        const user = await this.findOne(id);
        user.role = assignRoleDto.role;
        return this.userRepository.save(user);
    }
    async toggleActive(id) {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return this.userRepository.save(user);
    }
    async getStatistics() {
        const stats = await this.userRepository
            .createQueryBuilder('user')
            .select([
            'COUNT(*) as total',
            `SUM(CASE WHEN user.isActive = true THEN 1 ELSE 0 END) as active`,
            `SUM(CASE WHEN user.isActive = false THEN 1 ELSE 0 END) as inactive`,
            `SUM(CASE WHEN user.role = '${role_enum_1.Role.SUPER_ADMIN}' THEN 1 ELSE 0 END) as superAdmins`,
            `SUM(CASE WHEN user.role = '${role_enum_1.Role.ADMIN}' THEN 1 ELSE 0 END) as admins`,
            `SUM(CASE WHEN user.role = '${role_enum_1.Role.EMPLOYEE}' THEN 1 ELSE 0 END) as employees`,
        ])
            .getRawOne();
        return {
            total: parseInt(stats.total),
            active: parseInt(stats.active),
            inactive: parseInt(stats.inactive),
            byRole: {
                superAdmins: parseInt(stats.superadmins),
                admins: parseInt(stats.admins),
                employees: parseInt(stats.employees),
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map