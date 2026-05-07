import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupStatus } from '../../common/enums/task.enum';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  courseId: string;

  @ManyToOne('Course', 'groups', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'courseId' })
  course: any;

  @Column({ nullable: true })
  teacherId: string;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherId' })
  teacher: any;

  @Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.ACTIVE })
  status: GroupStatus;

  @Column({ nullable: true, type: 'date' })
  startDate: Date;

  @Column({ nullable: true, type: 'date' })
  endDate: Date;

  @Column({ nullable: true })
  schedule: string; // "Du-Cho-Ju 14:00-16:00"

  @Column({ nullable: true })
  room: string;

  @Column({ default: 0 })
  maxStudents: number;

  @OneToMany('GroupStudent', 'group')
  groupStudents: any[];

  @OneToMany('Attendance', 'group')
  attendances: any[];

  @OneToMany('Grade', 'group')
  grades: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
