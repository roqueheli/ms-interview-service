import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsController } from './interview-configs.controller';
import { InterviewConfigsService } from './interview-configs.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([InterviewConfig]),
        ClientsModule.registerAsync([
            {
                name: 'INTERVIEW_CONFIG_SERVICE',
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

                        // Configuración de reintentos
                        retryAttempts: configService.get('REDIS_RETRY_ATTEMPTS', 5),
                        retryDelay: configService.get('REDIS_RETRY_DELAY', 1000),

                        // Manejo de reconexión
                        reconnectOnError: (err) => {
                            console.log('Redis connection error:', err);
                            return true; // Intentar reconectar en caso de error
                        },

                        // Estrategia de reintento personalizada
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
                            return Math.min(options.attempt * 100, 3000); // Retraso exponencial
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [InterviewConfigsController],
    providers: [InterviewConfigsService],
    exports: [InterviewConfigsService],
})
export class InterviewConfigsModule {}