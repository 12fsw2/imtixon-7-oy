import { GroupsService } from './groups.service';
import { AddStudentToGroupDto, CreateGroupDto, GroupQueryDto, UpdateGroupDto } from './dto/group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(dto: CreateGroupDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/group.entity").Group>>;
    findAll(query: GroupQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<import("./entities/group.entity").Group>>;
    findOne(id: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/group.entity").Group>>;
    update(id: string, dto: UpdateGroupDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/group.entity").Group>>;
    remove(id: string): Promise<void>;
    addStudent(id: string, dto: AddStudentToGroupDto): Promise<import("../common/interfaces/api-response.interface").ApiResponse<import("./entities/group-student.entity").GroupStudent>>;
    removeStudent(id: string, studentId: string): Promise<import("../common/interfaces/api-response.interface").ApiResponse<unknown>>;
}
