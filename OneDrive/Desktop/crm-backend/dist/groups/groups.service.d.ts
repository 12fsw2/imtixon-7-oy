import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupStudent } from './entities/group-student.entity';
import { AddStudentToGroupDto, CreateGroupDto, GroupQueryDto, UpdateGroupDto } from './dto/group.dto';
export declare class GroupsService {
    private readonly groupRepository;
    private readonly groupStudentRepository;
    constructor(groupRepository: Repository<Group>, groupStudentRepository: Repository<GroupStudent>);
    create(dto: CreateGroupDto): Promise<Group>;
    findAll(query: GroupQueryDto): Promise<import("../common/interfaces/api-response.interface").PaginatedResponse<Group>>;
    findOne(id: string): Promise<Group>;
    update(id: string, dto: UpdateGroupDto): Promise<Group>;
    remove(id: string): Promise<void>;
    addStudent(groupId: string, dto: AddStudentToGroupDto): Promise<GroupStudent>;
    removeStudent(groupId: string, studentId: string): Promise<void>;
}
