import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';

let app: any = null;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors();
    
    // Set global prefix to empty string since Vercel handles the /api prefix
    app.setGlobalPrefix('');

    // Aplicar el guard global
    const authGuard = app.get(AuthGuard);
    app.useGlobalGuards(authGuard);

    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  // Fix the request object for Vercel and remove /api prefix
  if (req.url && !req.path) {
    // Remove /api prefix from the path
    const path = req.url.startsWith('/api') ? req.url.substring(4) : req.url;
    req.path = path;
    req.originalUrl = path;
    req.url = path;
  }
  
  const nestApp = await bootstrap();
  const expressApp = nestApp.getHttpAdapter().getInstance();
  
  // Handle the request
  expressApp(req, res);
} 