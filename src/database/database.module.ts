// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        return {
            type: 'postgres',
            url,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            synchronize: false,
        };
        },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
