import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentStatus } from '../../common/enums/task.enum';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Column({ nullable: true })
  note: string;

  @OneToMany('GroupStudent', 'student')
  groupStudents: any[];

  @OneToMany('Payment', 'student')
  payments: any[];

  @OneToMany('Attendance', 'student')
  attendances: any[];

  @OneToMany('Grade', 'student')
  grades: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
