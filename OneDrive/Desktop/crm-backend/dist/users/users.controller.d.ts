import { UsersService } from './users.service';
import { AssignRoleDto, CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/user.entity").User>>;
    findAll(query: UserQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/user.entity").User>>;
    getProfile(user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/user.entity").User>>;
    getStatistics(): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        byRole: {
            superAdmins: number;
            admins: number;
            employees: number;
        };
    }>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/user.entity").User>>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/user.entity").User>>;
    assignRole(id: string, assignRoleDto: AssignRoleDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/user.entity").User>>;
    toggleActive(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/user.entity").User>>;
    remove(id: string): Promise<void>;
}
