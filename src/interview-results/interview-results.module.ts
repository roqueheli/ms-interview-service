import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsController } from './interview-results.controller';
import { InterviewResultsService } from './interview-results.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([InterviewResult]),
        ClientsModule.registerAsync([
            {
                name: 'INTERVIEW_RESULT_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.REDIS,
                    options: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6380),
                        // Configuración de timeouts y reintentos
                        retryAttempts: configService.get('REDIS_RETRY_ATTEMPTS', 5),
                        retryDelay: configService.get('REDIS_RETRY_DELAY', 1000),
                        // Configuración de conexión
                        connectTimeout: 10000,
                        commandTimeout: 5000,
                        keepAlive: 1000,
                        // Manejo de reconexión
                        reconnectOnError: (err) => {
                            console.log('Redis connection error:', err);
                            return true; // Intentar reconectar en caso de error
                        },
                        retry_strategy: (options) => {
                            if (options.error && options.error.code === 'ECONNREFUSED') {
                                // Error de conexión rechazada
                                console.log('Redis connection refused. Retrying...');
                            }
                            if (options.total_retry_time > 1000 * 60 * 60) {
                                // Dejar de intentar después de 1 hora
                                return new Error('Redis retry time exhausted');
                            }
                            if (options.attempt > 10) {
                                // Dejar de intentar después de 10 intentos
                                return new Error('Redis retry attempts exhausted');
                            }
                            // Incrementar el tiempo de espera entre intentos
                            return Math.min(options.attempt * 100, 3000);
                        },
                        // Eventos de conexión
                        onConnect: () => {
                            console.log('Successfully connected to Redis');
                        },
                        onError: (err) => {
                            console.error('Redis error:', err);
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [InterviewResultsController],
    providers: [InterviewResultsService],
    exports: [InterviewResultsService],
})
export class InterviewResultsModule { }