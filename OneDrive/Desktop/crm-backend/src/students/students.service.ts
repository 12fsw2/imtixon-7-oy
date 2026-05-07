import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const existing = await this.studentRepository.findOne({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException('Bu telefon raqamli talaba allaqachon mavjud');
    const student = this.studentRepository.create(dto);
    return this.studentRepository.save(student);
  }

  async findAll(query: StudentQueryDto) {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.groupStudents', 'gs')
      .leftJoin('gs.group', 'group');

    if (search) {
      qb.andWhere(
        '(LOWER(student.firstName) LIKE :search OR LOWER(student.lastName) LIKE :search OR student.phone LIKE :search OR LOWER(student.email) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }
    if (status) qb.andWhere('student.status = :status', { status });
    if (query.groupId) qb.andWhere('gs.groupId = :groupId AND gs.isActive = true', { groupId: query.groupId });

    const allowedSort = ['createdAt', 'firstName', 'lastName'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`student.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.groupStudents', 'gs')
      .leftJoinAndSelect('gs.group', 'group')
      .leftJoinAndSelect('group.course', 'course')
      .where('student.id = :id', { id })
      .getOne();

    if (!student) throw new NotFoundException(`Talaba topilmadi`);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    if (dto.phone && dto.phone !== student.phone) {
      const existing = await this.studentRepository.findOne({ where: { phone: dto.phone } });
      if (existing) throw new ConflictException('Bu telefon raqam band');
    }
    Object.assign(student, dto);
    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
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
}
