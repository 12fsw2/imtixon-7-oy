import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne('Student', 'grades', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: any;

  @Column()
  groupId: string;

  @ManyToOne('Group', 'grades', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: any;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number; // 0-100

  @Column({ nullable: true })
  topic: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true, type: 'date' })
  date: Date;

  @Column({ nullable: true })
  gradedById: string;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gradedById' })
  gradedBy: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
