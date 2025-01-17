import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsController } from './interview-reports.controller';
import { InterviewReportsService } from './interview-reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([InterviewReport])],
    controllers: [InterviewReportsController],
    providers: [InterviewReportsService],
    exports: [InterviewReportsService],
})
export class InterviewReportsModule { }