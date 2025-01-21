import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InterviewConfigsModule } from '../interview-configs/interview-configs.module';
import { Interview } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Interview]),
        InterviewConfigsModule,
        ClientsModule.registerAsync([
            {
                name: 'INTERVIEW_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.REDIS,
                    options: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6380),
                        retryAttempts: 5,
                        retryDelay: 1000,
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [InterviewsController],
    providers: [InterviewsService],
    exports: [InterviewsService],
})
export class InterviewsModule { }