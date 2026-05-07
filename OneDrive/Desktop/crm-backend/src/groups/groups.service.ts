import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupStudent } from './entities/group-student.entity';
import { AddStudentToGroupDto, CreateGroupDto, GroupQueryDto, UpdateGroupDto } from './dto/group.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupStudent)
    private readonly groupStudentRepository: Repository<GroupStudent>,
  ) {}

  async create(dto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(dto);
    return this.groupRepository.save(group);
  }

  async findAll(query: GroupQueryDto) {
    const { page = 1, limit = 10, search, status, courseId, teacherId, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.course', 'course')
      .leftJoin('group.teacher', 'teacher')
      .addSelect(['course.id', 'course.name', 'teacher.id', 'teacher.firstName', 'teacher.lastName'])
      .loadRelationCountAndMap('group.studentCount', 'group.groupStudents', 'gs', qb =>
        qb.where('gs.isActive = true'),
      );

    if (search) {
      qb.andWhere('(LOWER(group.name) LIKE :search OR LOWER(group.schedule) LIKE :search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    if (status) qb.andWhere('group.status = :status', { status });
    if (courseId) qb.andWhere('group.courseId = :courseId', { courseId });
    if (teacherId) qb.andWhere('group.teacherId = :teacherId', { teacherId });

    const allowedSort = ['createdAt', 'name', 'startDate'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`group.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.course', 'course')
      .leftJoin('group.teacher', 'teacher')
      .addSelect(['teacher.id', 'teacher.firstName', 'teacher.lastName', 'teacher.email'])
      .leftJoinAndSelect('group.groupStudents', 'gs', 'gs.isActive = true')
      .leftJoinAndSelect('gs.student', 'student')
      .where('group.id = :id', { id })
      .getOne();

    if (!group) throw new NotFoundException(`Guruh topilmadi`);
    return group;
  }

  async update(id: string, dto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    Object.assign(group, dto);
    return this.groupRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    await this.groupRepository.remove(group);
  }

  async addStudent(groupId: string, dto: AddStudentToGroupDto): Promise<GroupStudent> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Guruh topilmadi`);

    const existing = await this.groupStudentRepository.findOne({
      where: { groupId, studentId: dto.studentId, isActive: true },
    });
    if (existing) throw new ConflictException('Talaba bu guruhda allaqachon bor');

    const gs = this.groupStudentRepository.create({
      groupId,
      studentId: dto.studentId,
      joinedAt: new Date(),
      isActive: true,
    });
    return this.groupStudentRepository.save(gs);
  }

  async removeStudent(groupId: string, studentId: string): Promise<void> {
    const gs = await this.groupStudentRepository.findOne({
      where: { groupId, studentId, isActive: true },
    });
    if (!gs) throw new NotFoundException(`Talaba bu guruhda topilmadi`);
    gs.isActive = false;
    await this.groupStudentRepository.save(gs);
  }
}
