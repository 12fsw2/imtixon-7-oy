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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./entities/student.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
let StudentsService = class StudentsService {
    constructor(studentRepository) {
        this.studentRepository = studentRepository;
    }
    async create(dto) {
        const existing = await this.studentRepository.findOne({ where: { phone: dto.phone } });
        if (existing)
            throw new common_1.ConflictException('Bu telefon raqamli talaba allaqachon mavjud');
        const student = this.studentRepository.create(dto);
        return this.studentRepository.save(student);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const qb = this.studentRepository
            .createQueryBuilder('student')
            .leftJoin('student.groupStudents', 'gs')
            .leftJoin('gs.group', 'group');
        if (search) {
            qb.andWhere('(LOWER(student.firstName) LIKE :search OR LOWER(student.lastName) LIKE :search OR student.phone LIKE :search OR LOWER(student.email) LIKE :search)', { search: `%${search.toLowerCase()}%` });
        }
        if (status)
            qb.andWhere('student.status = :status', { status });
        if (query.groupId)
            qb.andWhere('gs.groupId = :groupId AND gs.isActive = true', { groupId: query.groupId });
        const allowedSort = ['createdAt', 'firstName', 'lastName'];
        const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
        qb.orderBy(`student.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const student = await this.studentRepository
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.groupStudents', 'gs')
            .leftJoinAndSelect('gs.group', 'group')
            .leftJoinAndSelect('group.course', 'course')
            .where('student.id = :id', { id })
            .getOne();
        if (!student)
            throw new common_1.NotFoundException(`Talaba topilmadi`);
        return student;
    }
    async update(id, dto) {
        const student = await this.findOne(id);
        if (dto.phone && dto.phone !== student.phone) {
            const existing = await this.studentRepository.findOne({ where: { phone: dto.phone } });
            if (existing)
                throw new common_1.ConflictException('Bu telefon raqam band');
        }
        Object.assign(student, dto);
        return this.studentRepository.save(student);
    }
    async remove(id) {
        const student = await this.findOne(id);
        await this.studentRepository.remove(student);
    }
    async getStatistics() {
        const stats = await this.studentRepository
            .createQueryBuilder('student')
            .select([
            'COUNT(*) as total',
            `SUM(CASE WHEN student.status = 'ACTIVE' THEN 1 ELSE 0 END) as active`,
            `SUM(CASE WHEN student.status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive`,
            `SUM(CASE WHEN student.status = 'GRADUATED' THEN 1 ELSE 0 END) as graduated`,
            `SUM(CASE WHEN student.createdAt >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as newThisMonth`,
        ])
            .getRawOne();
        return {
            total: parseInt(stats.total),
            active: parseInt(stats.active),
            inactive: parseInt(stats.inactive),
            graduated: parseInt(stats.graduated),
            newThisMonth: parseInt(stats.newthismonth),
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map