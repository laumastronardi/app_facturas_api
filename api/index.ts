require('tsconfig-paths/register');
console.log('Handler loaded');

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

const server = express();
let isBootstrapped = false;

async function bootstrap() {
  if (!isBootstrapped) {
    console.log('Bootstrapping Nest app...');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    await app.init();
    isBootstrapped = true;
    console.log('Nest app bootstrapped');
  }
}

export default serverless(async (req, res) => {
  console.log('Request received');
  await bootstrap();
  return server(req, res);
});
