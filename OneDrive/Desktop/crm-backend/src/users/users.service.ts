import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { AssignRoleDto, CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { createPaginatedResponse } from '../common/interfaces/api-response.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, role, isActive, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.position',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
      ]);

    if (search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(user.position) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    const allowedSortFields = ['createdAt', 'firstName', 'lastName', 'email', 'role'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`user.${safeSortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.position',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
      ])
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async assignRole(id: string, assignRoleDto: AssignRoleDto): Promise<User> {
    const user = await this.findOne(id);
    user.role = assignRoleDto.role;
    return this.userRepository.save(user);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }

  async getStatistics() {
    const stats = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'COUNT(*) as total',
        `SUM(CASE WHEN user.isActive = true THEN 1 ELSE 0 END) as active`,
        `SUM(CASE WHEN user.isActive = false THEN 1 ELSE 0 END) as inactive`,
        `SUM(CASE WHEN user.role = '${Role.SUPER_ADMIN}' THEN 1 ELSE 0 END) as superAdmins`,
        `SUM(CASE WHEN user.role = '${Role.ADMIN}' THEN 1 ELSE 0 END) as admins`,
        `SUM(CASE WHEN user.role = '${Role.TEACHER}' THEN 1 ELSE 0 END) as teachers`,
        `SUM(CASE WHEN user.role = '${Role.CASHIER}' THEN 1 ELSE 0 END) as cashiers`,
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      inactive: parseInt(stats.inactive),
      byRole: {
        superAdmins: parseInt(stats.superadmins),
        admins: parseInt(stats.admins),
        teachers: parseInt(stats.teachers),
        cashiers: parseInt(stats.cashiers),
      },
    };
  }
}