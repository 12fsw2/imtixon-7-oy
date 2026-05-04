import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { AssignEmployeeDto, CreateDepartmentDto, DepartmentQueryDto, UpdateDepartmentDto } from './dto/department.dto';
import { User } from '../users/entities/user.entity';
export declare class DepartmentsService {
    private readonly departmentRepository;
    private readonly userRepository;
    constructor(departmentRepository: Repository<Department>, userRepository: Repository<User>);
    create(createDepartmentDto: CreateDepartmentDto): Promise<Department>;
    findAll(query: DepartmentQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Department>>;
    findOne(id: string): Promise<Department>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department>;
    remove(id: string): Promise<void>;
    assignEmployee(id: string, assignEmployeeDto: AssignEmployeeDto): Promise<User>;
    removeEmployee(departmentId: string, userId: string): Promise<User>;
}
