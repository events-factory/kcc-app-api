export class RegisterAttendeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  eventId: number;
}
