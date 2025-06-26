import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let app: any = null;

async function bootstrap() {
  if (!app) {
    console.log('Creating NestJS app...');
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors();
    
    // Set global prefix to empty string since Vercel handles the /api prefix
    app.setGlobalPrefix('');
    
    await app.init();
    console.log('NestJS app initialized successfully');
  }
  return app;
}

export default async function handler(req: any, res: any) {
  console.log(`Handler called: ${req.method} ${req.url}`);
  
  // Fix the request object for Vercel and remove /api prefix
  if (req.url && !req.path) {
    // Remove /api prefix from the path
    const path = req.url.startsWith('/api') ? req.url.substring(4) : req.url;
    req.path = path;
    req.originalUrl = path;
    req.url = path;
  }
  
  console.log('Fixed request path:', req.path);
  console.log('Fixed request originalUrl:', req.originalUrl);
  
  const nestApp = await bootstrap();
  const expressApp = nestApp.getHttpAdapter().getInstance();
  
  // Handle the request
  expressApp(req, res);
} 