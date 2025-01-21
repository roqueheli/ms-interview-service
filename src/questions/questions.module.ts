import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Question]),
        ClientsModule.registerAsync([
            {
                name: 'QUESTION_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.REDIS,
                    options: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6379),
                        retryAttempts: 5,
                        retryDelay: 1000,
                        // Configuraciones adicionales de Redis
                        reconnectOnError: (err) => {
                            console.log('Redis connection error:', err);
                            return true; // Intentar reconectar en caso de error
                        },
                        retry_strategy: (options) => {
                            if (options.attempt > 10) {
                                // Dejar de intentar después de 10 intentos
                                return new Error('Redis retry attempts exhausted');
                            }
                            // Incrementar el tiempo de espera entre intentos
                            return Math.min(options.attempt * 100, 3000);
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [QuestionsController],
    providers: [QuestionsService],
    exports: [QuestionsService],
})
export class QuestionsModule { }