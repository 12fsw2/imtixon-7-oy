import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Department])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
