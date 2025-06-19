import { DataSource } from 'typeorm';
import { seedEntrances } from './entrance.seed';

export const runSeeds = async (dataSource: DataSource) => {
  // Using the existing events in the database
  // First, check if there are any events
  const eventRepository = dataSource.getRepository('Event');
  const events = await eventRepository.find();

  if (events.length === 0) {
    console.log(
      'No events found. Please create at least one event before seeding entrances.',
    );
    return;
  }

  // For each event, seed entrances
  for (const event of events) {
    await seedEntrances(dataSource, event.id);
  }
};
