import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/user.dto';
import { Role } from '../common/enums/role.enum';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: Role;
            isActive: true;
        };
    }>>;
    register(createUserDto: CreateUserDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("../users/entities/user.entity").User>>;
    me(user: any): Promise<import("../common/interfaces/api-response.interface").ApiResponse<any>>;
}
