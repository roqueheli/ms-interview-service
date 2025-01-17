import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsController } from './interview-results.controller';
import { InterviewResultsService } from './interview-results.service';

@Module({
    imports: [TypeOrmModule.forFeature([InterviewResult])],
    controllers: [InterviewResultsController],
    providers: [InterviewResultsService],
    exports: [InterviewResultsService],
})
export class InterviewResultsModule { }