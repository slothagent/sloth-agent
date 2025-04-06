import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    
    // Configure CORS
    app.enableCors({
      origin: ['http://localhost:3000', 'https://www.slothai.xyz', 'https://slothai.xyz', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With', 'Accept'],
      credentials: true,
    });
    
    // Set global prefix
    app.setGlobalPrefix('api');
    
    if (process.env.NODE_ENV !== 'production') {
      await app.listen(5000);
      console.log(`Application is running on: ${await app.getUrl()}`);
    } else {
      await app.init();
    }
    
    cachedApp = app;
  }
  
  return cachedApp;
}

// Start the server in development mode
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export the handler for Vercel
export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(req, res);
}