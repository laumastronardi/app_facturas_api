// api/index.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );
    
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
    }));
    
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Configurar Swagger solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Invoices API')
        .setDescription('API to manage suppliers and invoices')
        .setVersion('1.0')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    }

    await app.init();
  }
  return app;
}

export default serverless(async (req, res) => {
  await bootstrap();
  return server(req, res);
});
