require('tsconfig-paths/register');
console.log('Handler loaded');

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

let nestApp: any = null;

async function bootstrap() {
  if (!nestApp) {
    const expressInstance = express();
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));
    nestApp.enableCors();
    await nestApp.init();
    (nestApp as any).expressInstance = expressInstance;
    console.log('Nest app bootstrapped');
  }
  return (nestApp as any).expressInstance;
}

export default serverless(async (req, res) => {
  console.log('Request received');
  const expressInstance = await bootstrap();
  return expressInstance(req, res);
});