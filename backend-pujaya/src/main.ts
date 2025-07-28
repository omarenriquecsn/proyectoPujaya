import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, raw } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.use((req, res, next) => {
    console.log(`DEBUG: Solicitud recibida - Método: ${req.method}, URL: ${req.url}`);
    next();
  });

  // 👇 Middleware global para parsear JSON en todas las rutas EXCEPTO el webhook
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
      next();
    } else {
      json()(req, res, next);
    }
  });

  // 👇 SOLO para el webhook de Stripe: body crudo
  app.use('/api/payments/webhook', raw({ type: 'application/json' }));

  // app.useGlobalPipes(new ValidationPipe())
  const confitSwagger = new DocumentBuilder()
    .setTitle('PujaYa API')
    .setDescription('Documentacion de la API')
    .setVersion('1.0')
    .addBearerAuth(
      {

        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization'
      }
    )
    .build()

  const document = SwaggerModule.createDocument(app, confitSwagger)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}
bootstrap();
