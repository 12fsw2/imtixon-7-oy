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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_entity_1 = require("./entities/group.entity");
const group_student_entity_1 = require("./entities/group-student.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
let GroupsService = class GroupsService {
    constructor(groupRepository, groupStudentRepository) {
        this.groupRepository = groupRepository;
        this.groupStudentRepository = groupStudentRepository;
    }
    async create(dto) {
        const group = this.groupRepository.create(dto);
        return this.groupRepository.save(group);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, courseId, teacherId, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const qb = this.groupRepository
            .createQueryBuilder('group')
            .leftJoin('group.course', 'course')
            .leftJoin('group.teacher', 'teacher')
            .addSelect(['course.id', 'course.name', 'teacher.id', 'teacher.firstName', 'teacher.lastName'])
            .loadRelationCountAndMap('group.studentCount', 'group.groupStudents', 'gs', qb => qb.where('gs.isActive = true'));
        if (search) {
            qb.andWhere('(LOWER(group.name) LIKE :search OR LOWER(group.schedule) LIKE :search)', {
                search: `%${search.toLowerCase()}%`,
            });
        }
        if (status)
            qb.andWhere('group.status = :status', { status });
        if (courseId)
            qb.andWhere('group.courseId = :courseId', { courseId });
        if (teacherId)
            qb.andWhere('group.teacherId = :teacherId', { teacherId });
        const allowedSort = ['createdAt', 'name', 'startDate'];
        const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
        qb.orderBy(`group.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const group = await this.groupRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.course', 'course')
            .leftJoin('group.teacher', 'teacher')
            .addSelect(['teacher.id', 'teacher.firstName', 'teacher.lastName', 'teacher.email'])
            .leftJoinAndSelect('group.groupStudents', 'gs', 'gs.isActive = true')
            .leftJoinAndSelect('gs.student', 'student')
            .where('group.id = :id', { id })
            .getOne();
        if (!group)
            throw new common_1.NotFoundException(`Guruh topilmadi`);
        return group;
    }
    async update(id, dto) {
        const group = await this.findOne(id);
        Object.assign(group, dto);
        return this.groupRepository.save(group);
    }
    async remove(id) {
        const group = await this.findOne(id);
        await this.groupRepository.remove(group);
    }
    async addStudent(groupId, dto) {
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group)
            throw new common_1.NotFoundException(`Guruh topilmadi`);
        const existing = await this.groupStudentRepository.findOne({
            where: { groupId, studentId: dto.studentId, isActive: true },
        });
        if (existing)
            throw new common_1.ConflictException('Talaba bu guruhda allaqachon bor');
        const gs = this.groupStudentRepository.create({
            groupId,
            studentId: dto.studentId,
            joinedAt: new Date(),
            isActive: true,
        });
        return this.groupStudentRepository.save(gs);
    }
    async removeStudent(groupId, studentId) {
        const gs = await this.groupStudentRepository.findOne({
            where: { groupId, studentId, isActive: true },
        });
        if (!gs)
            throw new common_1.NotFoundException(`Talaba bu guruhda topilmadi`);
        gs.isActive = false;
        await this.groupStudentRepository.save(gs);
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(1, (0, typeorm_1.InjectRepository)(group_student_entity_1.GroupStudent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GroupsService);
//# sourceMappingURL=groups.service.js.map