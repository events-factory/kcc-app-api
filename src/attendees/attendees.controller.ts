import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { Attendee } from './entities/attendee.entity';
import { RegisterAttendeeDto } from './dto/register-attendee.dto';
import { CheckInAttendeeDto } from './dto/check-in-attendee.dto';
import {
  BulkUploadAttendeesDto,
  BulkUploadResult,
} from './dto/bulk-upload-attendees.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('eventId') eventId?: number): Promise<Attendee[]> {
    if (eventId) {
      return this.attendeesService.findByEvent(eventId);
    }
    return this.attendeesService.findAll();
  }

  // Moving all specific routes BEFORE the generic :id route
  @UseGuards(JwtAuthGuard)
  @Get('badge/:badgeId')
  async findByBadgeId(@Param('badgeId') badgeId: string): Promise<Attendee> {
    try {
      return await this.attendeesService.findByBadgeId(badgeId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Attendee not found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId/stats')
  async getEventStatistics(@Param('eventId') eventId: string) {
    try {
      return await this.attendeesService.getEventStatistics(+eventId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get statistics',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId/recent-check-ins')
  async getRecentCheckIns(
    @Param('eventId') eventId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      return await this.attendeesService.getRecentCheckIns(+eventId, limit);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get recent check-ins',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Now the generic route AFTER all specific routes
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Attendee> {
    try {
      return await this.attendeesService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Attendee not found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(
    @Body() registerAttendeeDto: RegisterAttendeeDto,
  ): Promise<Attendee> {
    try {
      return await this.attendeesService.register(registerAttendeeDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Registration failed', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-in')
  async checkIn(@Body() checkInDto: CheckInAttendeeDto): Promise<Attendee> {
    try {
      return await this.attendeesService.checkIn(checkInDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Check-in failed', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      return await this.attendeesService.remove(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete attendee',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('bulk-upload')
  async bulkUpload(
    @Body() bulkUploadDto: BulkUploadAttendeesDto,
  ): Promise<BulkUploadResult> {
    try {
      return await this.attendeesService.bulkUpload(bulkUploadDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Bulk upload failed', HttpStatus.BAD_REQUEST);
    }
  }
}
