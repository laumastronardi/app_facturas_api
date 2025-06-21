import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';

export const AppDataSource = new DataSource({
  ...databaseConfig,
  synchronize: false, // asegurate de no hacer sync en prod desde CLI
  migrations: ['src/database/migrations/*.ts'],
});
