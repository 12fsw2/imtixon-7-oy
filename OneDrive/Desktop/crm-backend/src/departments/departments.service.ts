import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import {
  AssignEmployeeDto,
  CreateDepartmentDto,
  DepartmentQueryDto,
  UpdateDepartmentDto,
} from './dto/department.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const existing = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(query: DepartmentQueryDto) {
    const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.departmentRepository
      .createQueryBuilder('department')
      .loadRelationCountAndMap('department.employeeCount', 'department.employees')
      .loadRelationCountAndMap('department.taskCount', 'department.tasks');

    if (search) {
      qb.andWhere(
        '(LOWER(department.name) LIKE :search OR LOWER(department.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('department.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    const allowedSortFields = ['createdAt', 'name'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`department.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.employees', 'employee')
      .select([
        'department.id',
        'department.name',
        'department.description',
        'department.isActive',
        'department.createdAt',
        'department.updatedAt',
        'employee.id',
        'employee.firstName',
        'employee.lastName',
        'employee.email',
        'employee.role',
        'employee.position',
        'employee.isActive',
      ])
      .where('department.id = :id', { id })
      .getOne();

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existing = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });
      if (existing) {
        throw new ConflictException('Department name already in use');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    // Unassign users from department
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ departmentId: null })
      .where('departmentId = :id', { id })
      .execute();

    await this.departmentRepository.remove(department);
  }

  async assignEmployee(id: string, assignEmployeeDto: AssignEmployeeDto): Promise<User> {
    const department = await this.departmentRepository.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: assignEmployeeDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${assignEmployeeDto.userId} not found`);
    }

    user.departmentId = id;
    return this.userRepository.save(user);
  }

  async removeEmployee(departmentId: string, userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.departmentId !== departmentId) {
      throw new ConflictException('User does not belong to this department');
    }

    user.departmentId = null;
    return this.userRepository.save(user);
  }
}
