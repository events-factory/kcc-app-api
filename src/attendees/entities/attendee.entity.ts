import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  badgeId: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 191 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 191 })
  organization: string;

  @ManyToOne(() => Event)
  @JoinColumn()
  event: Event;

  @Column()
  eventId: number;

  @Column({ default: false })
  checkedIn: boolean;

  @Column({ nullable: true })
  checkInTime: Date;

  @Column({ nullable: true, length: 100 })
  entrance: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
