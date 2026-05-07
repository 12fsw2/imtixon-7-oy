import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AssignRoleDto, CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(query: UserQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<User>>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    assignRole(id: string, assignRoleDto: AssignRoleDto): Promise<User>;
    toggleActive(id: string): Promise<User>;
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byRole: {
            superAdmins: number;
            admins: number;
            teachers: number;
            cashiers: number;
        };
    }>;
}
