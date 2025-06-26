import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import express, { Request, Response } from 'express';

const server = express();
let nestApp: INestApplication | null = null;

async function bootstrap() {
  if (!nestApp) {
    console.log('Creating NestJS app...');
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));
    
    // Set global prefix to empty string since Vercel handles the /api prefix
    nestApp.setGlobalPrefix('');
    
    // Enable CORS
    nestApp.enableCors();
    
    await nestApp.init();
    console.log('NestJS app initialized successfully');
  }
  return server;
}

export default async function handler(req: Request, res: Response) {
  console.log(`Handler called: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  
  const app = await bootstrap();
  app(req, res);
}