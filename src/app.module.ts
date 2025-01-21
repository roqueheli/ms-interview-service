import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewConfigsModule } from './interview-configs/interview-configs.module';
import { InterviewReportsModule } from './interview-reports/interview-reports.module';
import { InterviewResultsModule } from './interview-results/interview-results.module';
import { InterviewsModule } from './interviews/interviews.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    ClientsModule.registerAsync([
      {
        name: 'INTERVIEW_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
            password: configService.get('REDIS_PASSWORD'),
            db: parseInt(configService.get('REDIS_DB', '0'), 10),

            // Convertir explícitamente a números
            connectTimeout: parseInt(configService.get('REDIS_CONNECT_TIMEOUT', '10000'), 10),
            commandTimeout: parseInt(configService.get('REDIS_COMMAND_TIMEOUT', '5000'), 10),
            keepAlive: 1000,

            retryAttempts: parseInt(configService.get('REDIS_RETRY_ATTEMPTS', '5'), 10),
            retryDelay: parseInt(configService.get('REDIS_RETRY_DELAY', '1000'), 10),

            reconnectOnError: (err) => {
              console.log('Redis connection error:', err);
              return true;
            },

            retry_strategy: (options) => {
              if (options.error && options.error.code === 'ECONNREFUSED') {
                console.log('Redis connection refused. Retrying...');
              }
              if (options.total_retry_time > 1000 * 60 * 60) {
                return new Error('Redis retry time exhausted');
              }
              if (options.attempt > 10) {
                return new Error('Redis retry attempts exhausted');
              }
              return Math.min(options.attempt * 100, 3000);
            }
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Módulos de la aplicación
    InterviewConfigsModule,
    InterviewsModule,
    QuestionsModule,
    InterviewResultsModule,
    InterviewReportsModule,
  ],
})
export class AppModule { }