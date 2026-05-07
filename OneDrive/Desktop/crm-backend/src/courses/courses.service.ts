import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const existing = await this.courseRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Bu nomli kurs allaqachon mavjud');
    const course = this.courseRepository.create(dto);
    return this.courseRepository.save(course);
  }

  async findAll(query: CourseQueryDto) {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.courseRepository
      .createQueryBuilder('course')
      .loadRelationCountAndMap('course.groupCount', 'course.groups');

    if (search) {
      qb.andWhere('(LOWER(course.name) LIKE :search OR LOWER(course.description) LIKE :search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    if (status) qb.andWhere('course.status = :status', { status });

    const allowedSort = ['createdAt', 'name', 'price'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`course.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.groups', 'group')
      .where('course.id = :id', { id })
      .getOne();

    if (!course) throw new NotFoundException(`Kurs topilmadi`);
    return course;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, dto);
    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }
}
