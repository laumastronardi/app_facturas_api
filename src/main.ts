import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  // Configurar guard global de autenticación
  const authGuard = app.get(AuthGuard);
  app.useGlobalGuards(authGuard);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Invoices API')
    .setDescription('API to manage suppliers and invoices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application listening on http://0.0.0.0:${port}`);
}
bootstrap();