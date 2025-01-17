import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewReportDto } from './dto/create-interview-report.dto';
import { UpdateInterviewReportDto } from './dto/update-interview-report.dto';
import { InterviewReport } from './entities/interview-report.entity';

@Injectable()
export class InterviewReportsService {
    constructor(
        @InjectRepository(InterviewReport)
        private readonly reportRepository: Repository<InterviewReport>,
    ) { }

    async create(createDto: CreateInterviewReportDto): Promise<InterviewReport> {
        const report = this.reportRepository.create(createDto);
        return await this.reportRepository.save(report);
    }

    async findAll(): Promise<InterviewReport[]> {
        return await this.reportRepository.find();
    }

    async findOne(id: string): Promise<InterviewReport> {
        const report = await this.reportRepository.findOneBy({ report_id: id });
        if (!report) {
            throw new NotFoundException(`Interview report with ID ${id} not found`);
        }
        return report;
    }

    async findByInterview(interviewId: string): Promise<InterviewReport[]> {
        return await this.reportRepository.find({
            where: { interview_id: interviewId },
        });
    }

    async update(id: string, updateDto: UpdateInterviewReportDto): Promise<InterviewReport> {
        const report = await this.findOne(id);
        Object.assign(report, updateDto);
        return await this.reportRepository.save(report);
    }

    async remove(id: string): Promise<void> {
        const report = await this.findOne(id);
        await this.reportRepository.remove(report);
    }

    async updateOverallScore(id: string, score: number): Promise<InterviewReport> {
        const report = await this.findOne(id);
        report.overall_score = score;
        return await this.reportRepository.save(report);
    }

    async updateRecommendations(id: string, recommendations: string): Promise<InterviewReport> {
        const report = await this.findOne(id);
        report.recommendations = recommendations;
        return await this.reportRepository.save(report);
    }

    async updateCompanyReport(id: string, companyReport: Record<string, any>): Promise<InterviewReport> {
        const report = await this.findOne(id);
        report.company_report = companyReport;
        return await this.reportRepository.save(report);
    }

    async updateCandidateReport(id: string, candidateReport: Record<string, any>): Promise<InterviewReport> {
        const report = await this.findOne(id);
        report.candidate_report = candidateReport;
        return await this.reportRepository.save(report);
    }
}