require('tsconfig-paths/register');

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

const server = express();
let nestApp: any = null;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));
    nestApp.enableCors();
    await nestApp.init();
  }
}

const handler = serverless(async (req, res) => {
  await bootstrap();
  return server(req, res);
});

export default handler;