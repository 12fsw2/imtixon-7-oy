import { DepartmentsService } from './departments.service';
import { AssignEmployeeDto, CreateDepartmentDto, DepartmentQueryDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: CreateDepartmentDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/department.entity").Department>>;
    findAll(query: DepartmentQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/department.entity").Department>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/department.entity").Department>>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/department.entity").Department>>;
    remove(id: string): Promise<void>;
    assignEmployee(id: string, assignEmployeeDto: AssignEmployeeDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("../users/entities/user.entity").User>>;
    removeEmployee(id: string, userId: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("../users/entities/user.entity").User>>;
}
