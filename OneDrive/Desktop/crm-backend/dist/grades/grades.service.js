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
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const grade_entity_1 = require("./entities/grade.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
let GradesService = class GradesService {
    constructor(gradeRepository) {
        this.gradeRepository = gradeRepository;
    }
    async create(dto, gradedById) {
        const grade = this.gradeRepository.create({ ...dto, gradedById });
        return this.gradeRepository.save(grade);
    }
    async findAll(query) {
        const { page = 1, limit = 10, studentId, groupId, sortBy = 'date', sortOrder = 'DESC' } = query;
        const qb = this.gradeRepository
            .createQueryBuilder('grade')
            .leftJoin('grade.student', 'student')
            .leftJoin('grade.group', 'group')
            .addSelect([
            'student.id', 'student.firstName', 'student.lastName',
            'group.id', 'group.name',
        ]);
        if (studentId)
            qb.andWhere('grade.studentId = :studentId', { studentId });
        if (groupId)
            qb.andWhere('grade.groupId = :groupId', { groupId });
        if (query.search) {
            qb.andWhere('LOWER(grade.topic) LIKE :search', { search: `%${query.search.toLowerCase()}%` });
        }
        qb.orderBy(`grade.${sortBy === 'date' ? 'date' : 'createdAt'}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const grade = await this.gradeRepository
            .createQueryBuilder('grade')
            .leftJoinAndSelect('grade.student', 'student')
            .leftJoinAndSelect('grade.group', 'group')
            .where('grade.id = :id', { id })
            .getOne();
        if (!grade)
            throw new common_1.NotFoundException(`Baho topilmadi`);
        return grade;
    }
    async update(id, dto) {
        const grade = await this.findOne(id);
        Object.assign(grade, dto);
        return this.gradeRepository.save(grade);
    }
    async remove(id) {
        const grade = await this.findOne(id);
        await this.gradeRepository.remove(grade);
    }
    async getStudentGradeReport(studentId, groupId) {
        const qb = this.gradeRepository
            .createQueryBuilder('grade')
            .where('grade.studentId = :studentId', { studentId });
        if (groupId)
            qb.andWhere('grade.groupId = :groupId', { groupId });
        const grades = await qb.getMany();
        const total = grades.length;
        const avgScore = total > 0 ? grades.reduce((sum, g) => sum + Number(g.score), 0) / total : 0;
        const maxScore = total > 0 ? Math.max(...grades.map(g => Number(g.score))) : 0;
        const minScore = total > 0 ? Math.min(...grades.map(g => Number(g.score))) : 0;
        return { total, avgScore: Math.round(avgScore * 10) / 10, maxScore, minScore, grades };
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(grade_entity_1.Grade)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GradesService);
//# sourceMappingURL=grades.service.js.map