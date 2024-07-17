import { DataSource } from 'typeorm';
import { WeatherCache } from '../models/weatherCache';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [WeatherCache],
  synchronize: true,
});

export const initializeDatabase = async () => {
  await AppDataSource.initialize();
};
