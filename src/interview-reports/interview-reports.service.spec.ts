import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewReportDto } from './dto/create-interview-report.dto';
import { UpdateInterviewReportDto } from './dto/update-interview-report.dto';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsService } from './interview-reports.service';

describe('InterviewReportsService', () => {
    let service: InterviewReportsService;
    let repository: Repository<InterviewReport>;

    const mockReport = {
        report_id: '123e4567-e89b-12d3-a456-426614174000',
        interview_id: '123e4567-e89b-12d3-a456-426614174001',
        company_report: { skills: { typescript: 8 } },
        candidate_report: { strengths: ['Good communication'] },
        overall_score: 85,
        recommendations: 'Continue practicing TypeScript',
        created_at: new Date(),
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterviewReportsService,
                {
                    provide: getRepositoryToken(InterviewReport),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<InterviewReportsService>(InterviewReportsService);
        repository = module.get<Repository<InterviewReport>>(getRepositoryToken(InterviewReport));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new interview report', async () => {
            const createDto: CreateInterviewReportDto = {
                interview_id: mockReport.interview_id,
                company_report: mockReport.company_report,
                candidate_report: mockReport.candidate_report,
                overall_score: mockReport.overall_score,
                recommendations: mockReport.recommendations,
            };

            mockRepository.create.mockReturnValue(mockReport);
            mockRepository.save.mockResolvedValue(mockReport);

            const result = await service.create(createDto);

            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(mockReport);
            expect(result).toEqual(mockReport);
        });
    });

    describe('findAll', () => {
        it('should return an array of interview reports', async () => {
            mockRepository.find.mockResolvedValue([mockReport]);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual([mockReport]);
        });
    });

    describe('findOne', () => {
        it('should return a single interview report', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockReport);

            const result = await service.findOne(mockReport.report_id);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(result).toEqual(mockReport);
        });

        it('should throw NotFoundException when report is not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne('nonexistent-id'))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('findByInterview', () => {
        it('should return reports for a specific interview', async () => {
            mockRepository.find.mockResolvedValue([mockReport]);

            const result = await service.findByInterview(mockReport.interview_id);

            expect(repository.find).toHaveBeenCalledWith({
                where: { interview_id: mockReport.interview_id },
            });
            expect(result).toEqual([mockReport]);
        });
    });

    describe('update', () => {
        it('should update an interview report', async () => {
            const updateDto: UpdateInterviewReportDto = {
                overall_score: 90,
                recommendations: 'Updated recommendations',
            };

            const updatedReport = { ...mockReport, ...updateDto };
            mockRepository.findOneBy.mockResolvedValue(mockReport);
            mockRepository.save.mockResolvedValue(updatedReport);

            const result = await service.update(mockReport.report_id, updateDto);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result).toEqual(updatedReport);
        });

        it('should throw NotFoundException when updating non-existent report', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update('nonexistent-id', {}))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview report', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockReport);
            mockRepository.remove.mockResolvedValue(mockReport);

            await service.remove(mockReport.report_id);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(repository.remove).toHaveBeenCalledWith(mockReport);
        });

        it('should throw NotFoundException when removing non-existent report', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove('nonexistent-id'))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('updateOverallScore', () => {
        it('should update the overall score of a report', async () => {
            const newScore = 95;
            const updatedReport = { ...mockReport, overall_score: newScore };

            mockRepository.findOneBy.mockResolvedValue(mockReport);
            mockRepository.save.mockResolvedValue(updatedReport);

            const result = await service.updateOverallScore(mockReport.report_id, newScore);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result.overall_score).toBe(newScore);
        });
    });

    describe('updateRecommendations', () => {
        it('should update the recommendations of a report', async () => {
            const newRecommendations = 'New recommendations';
            const updatedReport = { ...mockReport, recommendations: newRecommendations };

            mockRepository.findOneBy.mockResolvedValue(mockReport);
            mockRepository.save.mockResolvedValue(updatedReport);

            const result = await service.updateRecommendations(
                mockReport.report_id,
                newRecommendations
            );

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result.recommendations).toBe(newRecommendations);
        });
    });

    describe('updateCompanyReport', () => {
        it('should update the company report', async () => {
            const newCompanyReport = { skills: { typescript: 9 } };
            const updatedReport = { ...mockReport, company_report: newCompanyReport };

            mockRepository.findOneBy.mockResolvedValue(mockReport);
            mockRepository.save.mockResolvedValue(updatedReport);

            const result = await service.updateCompanyReport(
                mockReport.report_id,
                newCompanyReport
            );

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result.company_report).toEqual(newCompanyReport);
        });
    });

    describe('updateCandidateReport', () => {
        it('should update the candidate report', async () => {
            const newCandidateReport = { strengths: ['Excellent problem solving'] };
            const updatedReport = { ...mockReport, candidate_report: newCandidateReport };

            mockRepository.findOneBy.mockResolvedValue(mockReport);
            mockRepository.save.mockResolvedValue(updatedReport);

            const result = await service.updateCandidateReport(
                mockReport.report_id,
                newCandidateReport
            );

            expect(repository.findOneBy).toHaveBeenCalledWith({
                report_id: mockReport.report_id
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result.candidate_report).toEqual(newCandidateReport);
        });
    });
});
