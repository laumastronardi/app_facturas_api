import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import serverless from 'serverless-http';

let app: any = null;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(AppModule);
    
    // Enable CORS
    nestApp.enableCors();
    
    // Get the Express app
    app = nestApp.getHttpAdapter().getInstance();
  }
  return app;
}

export default serverless(async (req: any, res: any) => {
  const expressApp = await bootstrap();
  return expressApp(req, res);
});