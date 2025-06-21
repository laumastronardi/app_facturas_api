// src/config/database.config.ts
import { DataSourceOptions } from 'typeorm';
import { Invoice } from '../invoice/entities/invoice.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Invoice, Supplier]
};