import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsController } from './interview-configs.controller';
import { InterviewConfigsService } from './interview-configs.service';

@Module({
    imports: [TypeOrmModule.forFeature([InterviewConfig])],
    controllers: [InterviewConfigsController],
    providers: [InterviewConfigsService],
    exports: [InterviewConfigsService],
})
export class InterviewConfigsModule { }