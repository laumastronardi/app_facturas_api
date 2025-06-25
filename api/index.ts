require('tsconfig-paths/register');

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module'; // Import relativo

const server = express();
let isBootstrapped = false;

async function bootstrap() {
  if (!isBootstrapped) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    await app.init();
    isBootstrapped = true;
  }
}

const handler = serverless(async (req, res) => {
  await bootstrap();
  return server(req, res);
});

export default handler;