import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Student } from '../students/entities/student.entity';
import { Group } from '../groups/entities/group.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Group, Payment, Attendance, User])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}