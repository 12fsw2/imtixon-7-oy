import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { AddStudentToGroupDto, CreateGroupDto, GroupQueryDto, UpdateGroupDto } from './dto/group.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { createApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Groups')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Yangi guruh yaratish' })
  async create(@Body() dto: CreateGroupDto) {
    const data = await this.groupsService.create(dto);
    return createApiResponse('Guruh yaratildi', data, 201);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Barcha guruhlar' })
  async findAll(@Query() query: GroupQueryDto) {
    return this.groupsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Guruhni ID bo\'yicha olish (talabalar bilan)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.groupsService.findOne(id);
    return createApiResponse('Guruh topildi', data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Guruhni yangilash' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGroupDto) {
    const data = await this.groupsService.update(id, dto);
    return createApiResponse('Guruh yangilandi', data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Guruhni o\'chirish' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.groupsService.remove(id);
  }

  @Post(':id/students')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Guruhga talaba qo\'shish' })
  async addStudent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddStudentToGroupDto) {
    const data = await this.groupsService.addStudent(id, dto);
    return createApiResponse('Talaba guruhga qo\'shildi', data);
  }

  @Delete(':id/students/:studentId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Guruhdan talabani chiqarish' })
  async removeStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    await this.groupsService.removeStudent(id, studentId);
    return createApiResponse('Talaba guruhdan chiqarildi');
  }
}
