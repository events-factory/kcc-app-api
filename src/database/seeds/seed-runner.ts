import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from './seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const dataSource = app.get(DataSource);
    console.log('Starting database seeding...');
    await runSeeds(dataSource);
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
