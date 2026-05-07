import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceQueryDto, BulkAttendanceDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async create(dto: CreateAttendanceDto, userId: string): Promise<Attendance> {
    const attendance = this.attendanceRepository.create({ ...dto, markedById: userId });
    return this.attendanceRepository.save(attendance);
  }

  async bulkCreate(dto: BulkAttendanceDto, userId: string): Promise<Attendance[]> {
    const attendances = dto.records.map(record =>
      this.attendanceRepository.create({
        groupId: dto.groupId,
        date: dto.date as any,
        studentId: record.studentId,
        status: record.status,
        note: record.note,
        markedById: userId,
      }),
    );
    return this.attendanceRepository.save(attendances);
  }

  async findAll(query: AttendanceQueryDto) {
    const { page = 1, limit = 10, status, studentId, groupId, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' } = query;

    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.student', 'student')
      .leftJoin('attendance.group', 'group')
      .addSelect([
        'student.id', 'student.firstName', 'student.lastName',
        'group.id', 'group.name',
      ]);

    if (status) qb.andWhere('attendance.status = :status', { status });
    if (studentId) qb.andWhere('attendance.studentId = :studentId', { studentId });
    if (groupId) qb.andWhere('attendance.groupId = :groupId', { groupId });
    if (startDate) qb.andWhere('attendance.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('attendance.date <= :endDate', { endDate });

    qb.orderBy(`attendance.${sortBy === 'date' ? 'date' : 'createdAt'}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.group', 'group')
      .where('attendance.id = :id', { id })
      .getOne();

    if (!attendance) throw new NotFoundException(`Davomat yozuvi topilmadi`);
    return attendance;
  }

  async update(id: string, dto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, dto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async getGroupAttendanceReport(groupId: string, startDate?: string, endDate?: string) {
    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.student', 'student')
      .addSelect(['student.id', 'student.firstName', 'student.lastName'])
      .where('attendance.groupId = :groupId', { groupId });

    if (startDate) qb.andWhere('attendance.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('attendance.date <= :endDate', { endDate });

    const records = await qb.getMany();

    const studentMap = new Map();
    for (const record of records) {
      const key = (record as any).student?.id;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          student: (record as any).student,
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
}
