import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false  // Disable built-in bodyParser to prevent double-parsing
  });
  
  // Configure CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://www.slothai.xyz', 'https://slothai.xyz', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With', 'Accept'],
    credentials: true,
  });
  
  // Configure body parser with increased limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  await app.listen(5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
