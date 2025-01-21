import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsController } from './interview-reports.controller';
import { InterviewReportsService } from './interview-reports.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([InterviewReport]),
        ClientsModule.registerAsync([
            {
                name: 'INTERVIEW_REPORT_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.REDIS,
                    options: {
                        // Configuración básica
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6380),

                        // Configuración de timeouts
                        connectTimeout: configService.get('REDIS_CONNECT_TIMEOUT', 10000),
                        commandTimeout: configService.get('REDIS_COMMAND_TIMEOUT', 5000),
                        keepAlive: 1000,

                        // Configuración de reintentos
                        retryAttempts: configService.get('REDIS_RETRY_ATTEMPTS', 5),
                        retryDelay: configService.get('REDIS_RETRY_DELAY', 1000),

                        // Manejo de errores y reconexión
                        reconnectOnError: (err) => {
                            console.log('Redis connection error:', err);
                            // Intentar reconectar en caso de error
                            return true;
                        },

                        // Estrategia de reintento personalizada
                        retry_strategy: (options) => {
                            if (options.error && options.error.code === 'ECONNREFUSED') {
                                console.log('Redis connection refused. Retrying...');
                            }

                            // Límite de tiempo total de reintento (1 hora)
                            if (options.total_retry_time > 1000 * 60 * 60) {
                                return new Error('Redis retry time exhausted');
                            }

                            // Límite de intentos de reintento
                            if (options.attempt > 10) {
                                return new Error('Redis retry attempts exhausted');
                            }

                            // Retraso exponencial entre intentos (máx 3 segundos)
                            return Math.min(options.attempt * 100, 3000);
                        },

                        // Eventos de conexión
                        onConnect: () => {
                            console.log('Successfully connected to Redis');
                        },
                        onError: (err) => {
                            console.error('Redis error:', err);
                        },

                        // Configuración de caché
                        enableReadyCheck: true,
                        enableOfflineQueue: true,
                        maxRetriesPerRequest: 3,

                        // Configuración de TLS (si es necesario)
                        tls: configService.get('REDIS_TLS_ENABLED') ? {
                            rejectUnauthorized: false
                        } : undefined,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [InterviewReportsController],
    providers: [InterviewReportsService],
    exports: [InterviewReportsService],
})
export class InterviewReportsModule { }