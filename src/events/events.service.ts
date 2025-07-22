import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { Attendee } from '../attendees/entities/attendee.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Attendee)
    private attendeesRepository: Repository<Attendee>,
  ) {}

  async findAll(): Promise<Event[]> {
    const events = await this.eventsRepository.find();

    // Calculate real totals from attendee table for each event
    const eventsWithRealTotals = await Promise.all(
      events.map(async (event) => {
        const [totalRegistered, totalCheckedIn] = await Promise.all([
          this.attendeesRepository.count({
            where: { eventId: event.id },
          }),
          this.attendeesRepository.count({
            where: { eventId: event.id, checkedIn: true },
          }),
        ]);

        return {
          ...event,
          registeredCount: totalRegistered,
          checkedInCount: totalCheckedIn,
        };
      }),
    );

    return eventsWithRealTotals;
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Calculate real totals from attendee table
    const [totalRegistered, totalCheckedIn] = await Promise.all([
      this.attendeesRepository.count({
        where: { eventId: event.id },
      }),
      this.attendeesRepository.count({
        where: { eventId: event.id, checkedIn: true },
      }),
    ]);

    return {
      ...event,
      registeredCount: totalRegistered,
      checkedInCount: totalCheckedIn,
    };
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async update(
    id: number,
    updateEventDto: Partial<CreateEventDto>,
  ): Promise<Event> {
    const event = await this.findOne(id);

    Object.assign(event, updateEventDto);

    return this.eventsRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  async incrementRegisteredCount(id: number): Promise<Event> {
    const event = await this.findOne(id);
    event.registeredCount += 1;
    return this.eventsRepository.save(event);
  }

  async incrementCheckedInCount(id: number): Promise<Event> {
    const event = await this.findOne(id);
    event.checkedInCount += 1;
    return this.eventsRepository.save(event);
  }
}
