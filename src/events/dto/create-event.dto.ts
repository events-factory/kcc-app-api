export class CreateEventDto {
  name: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  attendeeLimit: number;
}
