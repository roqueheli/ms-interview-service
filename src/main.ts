import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { redisConfig } from './config/redis.config';

export async function bootstrap() {
  // Crear la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // Obtener el ConfigService
  const configService = app.get(ConfigService);

  // Configurar microservicio Redis
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisConfig.host,
      port: redisConfig.port,
    },
  });

  // Configurar prefijo global
  app.setGlobalPrefix('api');

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Interview Service API')
    .setDescription('API for managing technical interviews')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar microservicio Redis
  await app.startAllMicroservices();

  // Iniciar servidor HTTP
  const port = configService.get('PORT', 3003);
  await app.listen(port);

  // Logging
  console.log(`🚀 HTTP server running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  console.log(`📮 Redis microservice is running`);
}

// Solo ejecutar bootstrap si este archivo es el punto de entrada
if (require.main === module) {
  bootstrap();
}
