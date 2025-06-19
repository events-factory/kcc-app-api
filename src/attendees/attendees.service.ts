import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from './entities/attendee.entity';
import { RegisterAttendeeDto } from './dto/register-attendee.dto';
import { CheckInAttendeeDto } from './dto/check-in-attendee.dto';
import { EventsService } from '../events/events.service';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private attendeesRepository: Repository<Attendee>,
    private eventsService: EventsService,
  ) {}

  async findAll(): Promise<Attendee[]> {
    return this.attendeesRepository.find();
  }

  async findByEvent(eventId: number): Promise<Attendee[]> {
    return this.attendeesRepository.find({
      where: { eventId },
      relations: ['event'],
    });
  }

  async findOne(id: number): Promise<Attendee> {
    const attendee = await this.attendeesRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${id} not found`);
    }

    return attendee;
  }

  async findByBadgeId(badgeId: string): Promise<Attendee> {
    const attendee = await this.attendeesRepository.findOne({
      where: { badgeId },
      relations: ['event'],
    });

    if (!attendee) {
      throw new NotFoundException(
        `Attendee with badge ID ${badgeId} not found`,
      );
    }

    return attendee;
  }

  async register(registerAttendeeDto: RegisterAttendeeDto): Promise<Attendee> {
    // Check if event exists
    const event = await this.eventsService.findOne(registerAttendeeDto.eventId);

    // Check if attendee limit is reached
    if (
      event.attendeeLimit > 0 &&
      event.registeredCount >= event.attendeeLimit
    ) {
      throw new ConflictException('Event has reached its attendee limit');
    }

    // Check if email is already registered for this event
    const existingAttendee = await this.attendeesRepository.findOne({
      where: {
        email: registerAttendeeDto.email,
        eventId: registerAttendeeDto.eventId,
      },
    });

    if (existingAttendee) {
      throw new ConflictException('Email is already registered for this event');
    }

    // Generate a unique badge ID
    const badgeId = this.generateBadgeId();

    // Create and save the attendee
    const attendee = this.attendeesRepository.create({
      ...registerAttendeeDto,
      badgeId,
    });

    const savedAttendee = await this.attendeesRepository.save(attendee);

    // Increment the registered count of the event
    await this.eventsService.incrementRegisteredCount(
      registerAttendeeDto.eventId,
    );

    return savedAttendee;
  }

  async checkIn(checkInDto: CheckInAttendeeDto): Promise<Attendee> {
    // Find the attendee
    const attendee = await this.attendeesRepository.findOne({
      where: {
        badgeId: checkInDto.badgeId,
        eventId: checkInDto.eventId,
      },
    });

    if (!attendee) {
      throw new NotFoundException(
        `Attendee with badge ID ${checkInDto.badgeId} not found for this event`,
      );
    }

    // Check if already checked in
    if (attendee.checkedIn) {
      throw new ConflictException('Attendee is already checked in');
    }

    // Update the attendee
    attendee.checkedIn = true;
    attendee.checkInTime = new Date();
    attendee.entrance = checkInDto.entrance;

    const updatedAttendee = await this.attendeesRepository.save(attendee);

    // Increment the checked-in count of the event
    await this.eventsService.incrementCheckedInCount(checkInDto.eventId);

    return updatedAttendee;
  }

  async remove(id: number): Promise<void> {
    const attendee = await this.findOne(id);
    await this.attendeesRepository.remove(attendee);
  }

  private generateBadgeId(): string {
    // Generate a 6-digit badge ID like B12345
    const prefix = 'B';
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number between 10000-99999
    return prefix + randomNum.toString();
  }

  async getEventStatistics(eventId: number): Promise<{
    totalRegistered: number;
    totalCheckedIn: number;
    checkInRate: number;
  }> {
    // Find the event
    const event = await this.eventsService.findOne(eventId);

    // Calculate statistics
    const totalRegistered = event.registeredCount;
    const totalCheckedIn = event.checkedInCount;
    const checkInRate =
      totalRegistered > 0 ? (totalCheckedIn / totalRegistered) * 100 : 0;

    return {
      totalRegistered,
      totalCheckedIn,
      checkInRate,
    };
  }

  async getRecentCheckIns(
    eventId: number,
    limit: number = 10,
  ): Promise<Attendee[]> {
    return this.attendeesRepository.find({
      where: {
        eventId,
        checkedIn: true,
      },
      order: {
        checkInTime: 'DESC',
      },
      take: limit,
    });
  }
}
