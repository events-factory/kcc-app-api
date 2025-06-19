import { DataSource } from 'typeorm';
import { Entrance } from '../../entrances/entities/entrance.entity';

export const seedEntrances = async (
  dataSource: DataSource,
  eventId: number,
) => {
  const entranceRepository = dataSource.getRepository(Entrance);

  // Check if entrances already exist for this event
  const existingCount = await entranceRepository.count({ where: { eventId } });

  if (existingCount > 0) {
    console.log(
      `Skipping entrances seed: ${existingCount} entrances already exist for event ${eventId}`,
    );
    return;
  }

  const entrances = [
    {
      name: 'Main Entrance',
      description: 'Front entrance of the convention center',
      eventId,
      scannedCount: 58,
      lastScanTime: new Date(),
    },
    {
      name: 'VIP Entrance',
      description: 'Exclusive entrance for VIP guests',
      eventId,
      scannedCount: 24,
      lastScanTime: new Date(),
    },
    {
      name: 'East Wing Entrance',
      description: 'Side entrance near the East Wing exhibition hall',
      eventId,
      scannedCount: 42,
      lastScanTime: new Date(),
    },
    {
      name: 'West Wing Entrance',
      description: 'Side entrance near the West Wing meeting rooms',
      eventId,
      scannedCount: 33,
      lastScanTime: new Date(),
    },
    {
      name: 'Staff Entrance',
      description: 'Dedicated entrance for event staff and speakers',
      eventId,
      scannedCount: 17,
      lastScanTime: new Date(),
    },
  ];

  try {
    // Insert entrances
    await entranceRepository.save(entrances);
    console.log(
      `Successfully seeded ${entrances.length} entrances for event ${eventId}`,
    );
  } catch (error) {
    console.error('Error seeding entrances:', error);
  }
};
