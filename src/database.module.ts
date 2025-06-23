// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    // Levantamos ConfigModule aquí para que DatabaseModule pueda leer vars
    ConfigModule.forRoot({
      isGlobal: true,               // disponible en toda la app
      envFilePath: ['.env'],        // podés cambiar según entornos
    }),

    // Configuramos TypeORM en modo async, leyendo de ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        console.log('[DatabaseModule] DATABASE_URL =', url);
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
