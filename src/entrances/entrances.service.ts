import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entrance } from './entities/entrance.entity';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { EventsService } from '../events/events.service';

@Injectable()
export class EntrancesService {
  constructor(
    @InjectRepository(Entrance)
    private entrancesRepository: Repository<Entrance>,
    private eventsService: EventsService,
  ) {}

  async findAll(): Promise<Entrance[]> {
    return this.entrancesRepository.find();
  }

  async findByEvent(eventId: number): Promise<Entrance[]> {
    return this.entrancesRepository.find({
      where: { eventId },
      relations: ['event'],
    });
  }

  async findOne(id: number): Promise<Entrance> {
    const entrance = await this.entrancesRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!entrance) {
      throw new NotFoundException(`Entrance with ID ${id} not found`);
    }

    return entrance;
  }

  async create(createEntranceDto: CreateEntranceDto): Promise<Entrance> {
    // Check if event exists
    await this.eventsService.findOne(createEntranceDto.eventId);

    // Create and save the entrance
    const entrance = this.entrancesRepository.create(createEntranceDto);
    return this.entrancesRepository.save(entrance);
  }

  async update(
    id: number,
    updateEntranceDto: Partial<CreateEntranceDto>,
  ): Promise<Entrance> {
    const entrance = await this.findOne(id);

    // If eventId is provided, check if event exists
    if (updateEntranceDto.eventId) {
      await this.eventsService.findOne(updateEntranceDto.eventId);
    }

    Object.assign(entrance, updateEntranceDto);

    return this.entrancesRepository.save(entrance);
  }

  async remove(id: number): Promise<void> {
    const entrance = await this.findOne(id);
    await this.entrancesRepository.remove(entrance);
  }

  async incrementScanCount(id: number): Promise<Entrance> {
    const entrance = await this.findOne(id);
    entrance.scannedCount += 1;
    entrance.lastScanTime = new Date();
    return this.entrancesRepository.save(entrance);
  }

  async getEntranceStatistics(eventId: number): Promise<{
    entrances: { name: string; count: number; percentage: number }[];
    totalCheckedIn: number;
  }> {
    // Get all entrances for this event
    const entrances = await this.findByEvent(eventId);

    // Get event statistics
    const event = await this.eventsService.findOne(eventId);
    const totalCheckedIn = event.checkedInCount;

    // Calculate statistics for each entrance
    const entranceStats = entrances.map((entrance) => {
      const percentage =
        totalCheckedIn > 0 ? (entrance.scannedCount / totalCheckedIn) * 100 : 0;

      return {
        name: entrance.name,
        count: entrance.scannedCount,
        percentage: Number(percentage.toFixed(2)),
      };
    });

    return {
      entrances: entranceStats,
      totalCheckedIn,
    };
  }
}
