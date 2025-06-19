import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntrancesService } from './entrances.service';
import { Entrance } from './entities/entrance.entity';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('entrances')
export class EntrancesController {
  constructor(private readonly entrancesService: EntrancesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('eventId') eventId?: number): Promise<Entrance[]> {
    if (eventId) {
      return this.entrancesService.findByEvent(eventId);
    }
    return this.entrancesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId/stats')
  async getEntranceStatistics(@Param('eventId') eventId: string) {
    try {
      return await this.entrancesService.getEntranceStatistics(+eventId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get entrance statistics',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Entrance> {
    try {
      return await this.entrancesService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Entrance not found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(
    @Body() createEntranceDto: CreateEntranceDto,
  ): Promise<Entrance> {
    try {
      return await this.entrancesService.create(createEntranceDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create entrance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEntranceDto: Partial<CreateEntranceDto>,
  ): Promise<Entrance> {
    try {
      return await this.entrancesService.update(+id, updateEntranceDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update entrance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      return await this.entrancesService.remove(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete entrance',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/increment-scan')
  async incrementScanCount(@Param('id') id: string): Promise<Entrance> {
    try {
      return await this.entrancesService.incrementScanCount(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to increment scan count',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
