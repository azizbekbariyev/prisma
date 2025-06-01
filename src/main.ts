import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function start() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const PORT = config.get<number>("PORT")
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  await app.listen(PORT ?? 3003, ()=>{
    console.log(`Server started at: http://localhost:${PORT}`);
  });
}
start();
