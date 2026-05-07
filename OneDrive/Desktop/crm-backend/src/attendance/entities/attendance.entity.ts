import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttendanceStatus } from '../../common/enums/task.enum';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne('Student', 'attendances', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: any;

  @Column()
  groupId: string;

  @ManyToOne('Group', 'attendances', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: any;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  markedById: string;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'markedById' })
  markedBy: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
