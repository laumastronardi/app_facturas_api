import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any = null;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const nestApp = await bootstrap();
  const expressApp = nestApp.getHttpAdapter().getInstance();
  
  return expressApp(req, res);
} 