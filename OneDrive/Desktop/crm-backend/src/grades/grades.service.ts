import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto, GradeQueryDto, UpdateGradeDto } from './dto/grade.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async create(dto: CreateGradeDto, gradedById: string): Promise<Grade> {
    const grade = this.gradeRepository.create({ ...dto, gradedById });
    return this.gradeRepository.save(grade);
  }

  async findAll(query: GradeQueryDto) {
    const { page = 1, limit = 10, studentId, groupId, sortBy = 'date', sortOrder = 'DESC' } = query;

    const qb = this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoin('grade.student', 'student')
      .leftJoin('grade.group', 'group')
      .addSelect([
        'student.id', 'student.firstName', 'student.lastName',
        'group.id', 'group.name',
      ]);

    if (studentId) qb.andWhere('grade.studentId = :studentId', { studentId });
    if (groupId) qb.andWhere('grade.groupId = :groupId', { groupId });
    if (query.search) {
      qb.andWhere('LOWER(grade.topic) LIKE :search', { search: `%${query.search.toLowerCase()}%` });
    }

    qb.orderBy(`grade.${sortBy === 'date' ? 'date' : 'createdAt'}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('grade.group', 'group')
      .where('grade.id = :id', { id })
      .getOne();

    if (!grade) throw new NotFoundException(`Baho topilmadi`);
    return grade;
  }

  async update(id: string, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);
    Object.assign(grade, dto);
    return this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradeRepository.remove(grade);
  }

  async getStudentGradeReport(studentId: string, groupId?: string) {
    const qb = this.gradeRepository
      .createQueryBuilder('grade')
      .where('grade.studentId = :studentId', { studentId });

    if (groupId) qb.andWhere('grade.groupId = :groupId', { groupId });

    const grades = await qb.getMany();
    const total = grades.length;
    const avgScore = total > 0 ? grades.reduce((sum, g) => sum + Number(g.score), 0) / total : 0;
    const maxScore = total > 0 ? Math.max(...grades.map(g => Number(g.score))) : 0;
    const minScore = total > 0 ? Math.min(...grades.map(g => Number(g.score))) : 0;

    return { total, avgScore: Math.round(avgScore * 10) / 10, maxScore, minScore, grades };
  }
}
