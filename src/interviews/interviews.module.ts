import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewConfigsModule } from '../interview-configs/interview-configs.module';
import { Interview } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Interview]),
        InterviewConfigsModule,
    ],
    controllers: [InterviewsController],
    providers: [InterviewsService],
    exports: [InterviewsService],
})
export class InterviewsModule { }