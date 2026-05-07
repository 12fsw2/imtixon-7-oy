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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("./entities/attendance.entity");
const api_response_interface_1 = require("../common/interfaces/api-response.interface");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }
    async create(dto, userId) {
        const attendance = this.attendanceRepository.create({ ...dto, markedById: userId });
        return this.attendanceRepository.save(attendance);
    }
    async bulkCreate(dto, userId) {
        const attendances = dto.records.map(record => this.attendanceRepository.create({
            groupId: dto.groupId,
            date: dto.date,
            studentId: record.studentId,
            status: record.status,
            note: record.note,
            markedById: userId,
        }));
        return this.attendanceRepository.save(attendances);
    }
    async findAll(query) {
        const { page = 1, limit = 10, status, studentId, groupId, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' } = query;
        const qb = this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoin('attendance.student', 'student')
            .leftJoin('attendance.group', 'group')
            .addSelect([
            'student.id', 'student.firstName', 'student.lastName',
            'group.id', 'group.name',
        ]);
        if (status)
            qb.andWhere('attendance.status = :status', { status });
        if (studentId)
            qb.andWhere('attendance.studentId = :studentId', { studentId });
        if (groupId)
            qb.andWhere('attendance.groupId = :groupId', { groupId });
        if (startDate)
            qb.andWhere('attendance.date >= :startDate', { startDate });
        if (endDate)
            qb.andWhere('attendance.date <= :endDate', { endDate });
        qb.orderBy(`attendance.${sortBy === 'date' ? 'date' : 'createdAt'}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, api_response_interface_1.createPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const attendance = await this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoinAndSelect('attendance.student', 'student')
            .leftJoinAndSelect('attendance.group', 'group')
            .where('attendance.id = :id', { id })
            .getOne();
        if (!attendance)
            throw new common_1.NotFoundException(`Davomat yozuvi topilmadi`);
        return attendance;
    }
    async update(id, dto) {
        const attendance = await this.findOne(id);
        Object.assign(attendance, dto);
        return this.attendanceRepository.save(attendance);
    }
    async remove(id) {
        const attendance = await this.findOne(id);
        await this.attendanceRepository.remove(attendance);
    }
    async getGroupAttendanceReport(groupId, startDate, endDate) {
        const qb = this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoin('attendance.student', 'student')
            .addSelect(['student.id', 'student.firstName', 'student.lastName'])
            .where('attendance.groupId = :groupId', { groupId });
        if (startDate)
            qb.andWhere('attendance.date >= :startDate', { startDate });
        if (endDate)
            qb.andWhere('attendance.date <= :endDate', { endDate });
        const records = await qb.getMany();
        const studentMap = new Map();
        for (const record of records) {
            const key = record.student?.id;
            if (!studentMap.has(key)) {
                studentMap.set(key, {
                    student: record.student,
                    present: 0, absent: 0, late: 0, excused: 0, total: 0,
                });
            }
            const s = studentMap.get(key);
            s.total++;
            s[record.status.toLowerCase()]++;
        }
        return Array.from(studentMap.values()).map(s => ({
            ...s,
            attendanceRate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
        }));
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map