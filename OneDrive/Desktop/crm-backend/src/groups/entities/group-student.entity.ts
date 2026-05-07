import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('group_students')
export class GroupStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @ManyToOne('Group', 'groupStudents', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: any;

  @Column()
  studentId: string;

  @ManyToOne('Student', 'groupStudents', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: any;

  @Column({ nullable: true, type: 'date' })
  joinedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
