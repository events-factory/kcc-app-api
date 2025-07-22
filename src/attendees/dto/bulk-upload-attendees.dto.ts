import { RegisterAttendeeDto } from './register-attendee.dto';

export class BulkUploadAttendeesDto {
  attendees: RegisterAttendeeDto[];
  eventId: number;
  skipDuplicates?: boolean; // Optional flag to skip duplicate emails instead of throwing error
}

export class BulkUploadResult {
  success: {
    count: number;
    attendees: any[]; // Successfully registered attendees
  };
  errors: {
    count: number;
    details: Array<{
      index: number;
      attendee: RegisterAttendeeDto;
      error: string;
    }>;
  };
  summary: {
    totalProcessed: number;
    successfulRegistrations: number;
    failedRegistrations: number;
    duplicatesSkipped: number;
  };
}
