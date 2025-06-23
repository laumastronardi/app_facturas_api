// api/index.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from './app.module';

const server = express();
let isBootstraped = false;

async function bootstrap() {
  if (isBootstraped) return;
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );
  app.enableCors();
  await app.init();
  isBootstraped = true;
}

export default serverless(async (req, res) => {
  await bootstrap();
  return server(req, res);
});
