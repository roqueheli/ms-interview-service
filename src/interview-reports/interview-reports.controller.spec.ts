import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInterviewReportDto } from './dto/create-interview-report.dto';
import { UpdateInterviewReportDto } from './dto/update-interview-report.dto';
import { UpdateOverallScoreDto } from './dto/update-overall-score.dto';
import { UpdateRecommendationsDto } from './dto/update-recommendations.dto';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsController } from './interview-reports.controller';
import { InterviewReportsService } from './interview-reports.service';

describe('InterviewReportsController', () => {
    let controller: InterviewReportsController;
    let service: InterviewReportsService;

    const mockReport: InterviewReport = {
        report_id: '123e4567-e89b-12d3-a456-426614174000',
        interview_id: '123e4567-e89b-12d3-a456-426614174001',
        company_report: {
            technical_score: 85,
            communication_score: 90,
            detailed_feedback: {}
        },
        candidate_report: {
            overall_performance: 'Excellent',
            areas_of_improvement: []
        },
        overall_score: 87.5,
        recommendations: 'Consider focusing on system design concepts',
        created_at: new Date()
    };

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByInterview: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        updateOverallScore: jest.fn(),
        updateRecommendations: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewReportsController],
            providers: [
                {
                    provide: InterviewReportsService,
                    useValue: mockService
                }
            ]
        }).compile();

        controller = module.get<InterviewReportsController>(InterviewReportsController);
        service = module.get<InterviewReportsService>(InterviewReportsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new interview report', async () => {
            const createDto: CreateInterviewReportDto = {
                interview_id: mockReport.interview_id,
                company_report: mockReport.company_report,
                candidate_report: mockReport.candidate_report,
                overall_score: mockReport.overall_score,
                recommendations: mockReport.recommendations
            };

            jest.spyOn(service, 'create').mockResolvedValue(mockReport);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockReport);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of interview reports', async () => {
            const reports = [mockReport];
            jest.spyOn(service, 'findAll').mockResolvedValue(reports);

            const result = await controller.findAll();

            expect(result).toEqual(reports);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single interview report', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(mockReport);

            const result = await controller.findOne(mockReport.report_id);

            expect(result).toEqual(mockReport);
            expect(service.findOne).toHaveBeenCalledWith(mockReport.report_id);
        });

        it('should throw NotFoundException when report is not found', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

            await expect(controller.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByInterview', () => {
        it('should return reports for a specific interview', async () => {
            const reports = [mockReport];
            jest.spyOn(service, 'findByInterview').mockResolvedValue(reports);

            const result = await controller.findByInterview(mockReport.interview_id);

            expect(result).toEqual(reports);
            expect(service.findByInterview).toHaveBeenCalledWith(mockReport.interview_id);
        });
    });

    describe('update', () => {
        it('should update an interview report', async () => {
            const updateDto: UpdateInterviewReportDto = {
                company_report: { technical_score: 90 }
            };

            jest.spyOn(service, 'update').mockResolvedValue({
                ...mockReport,
                company_report: { ...mockReport.company_report, technical_score: 90 }
            });

            const result = await controller.update(mockReport.report_id, updateDto);

            expect(result.company_report.technical_score).toBe(90);
            expect(service.update).toHaveBeenCalledWith(mockReport.report_id, updateDto);
        });

        it('should throw NotFoundException when updating non-existent report', async () => {
            const updateDto: UpdateInterviewReportDto = {};
            jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

            await expect(controller.update('nonexistent-id', updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview report', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue(undefined);

            await controller.remove(mockReport.report_id);

            expect(service.remove).toHaveBeenCalledWith(mockReport.report_id);
        });

        it('should throw NotFoundException when removing non-existent report', async () => {
            jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

            await expect(controller.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateOverallScore', () => {
        it('should update only the overall score', async () => {
            const scoreDto: UpdateOverallScoreDto = {
                overall_score: 95.0
            };

            jest.spyOn(service, 'updateOverallScore').mockResolvedValue({
                ...mockReport,
                overall_score: 95.0
            });

            const result = await controller.updateOverallScore(mockReport.report_id, scoreDto);

            expect(result.overall_score).toBe(95.0);
            expect(service.updateOverallScore).toHaveBeenCalledWith(mockReport.report_id, scoreDto.overall_score);
        });

        it('should throw NotFoundException when updating score of non-existent report', async () => {
            const scoreDto: UpdateOverallScoreDto = { overall_score: 95.0 };
            jest.spyOn(service, 'updateOverallScore').mockRejectedValue(new NotFoundException());

            await expect(controller.updateOverallScore('nonexistent-id', scoreDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateRecommendations', () => {
        it('should update only the recommendations', async () => {
            const recommendationsDto: UpdateRecommendationsDto = {
                recommendations: 'New recommendations'
            };

            jest.spyOn(service, 'updateRecommendations').mockResolvedValue({
                ...mockReport,
                recommendations: 'New recommendations'
            });

            const result = await controller.updateRecommendations(mockReport.report_id, recommendationsDto);

            expect(result.recommendations).toBe('New recommendations');
            expect(service.updateRecommendations).toHaveBeenCalledWith(
                mockReport.report_id,
                recommendationsDto.recommendations
            );
        });

        it('should throw NotFoundException when updating recommendations of non-existent report', async () => {
            const recommendationsDto: UpdateRecommendationsDto = {
                recommendations: 'New recommendations'
            };
            jest.spyOn(service, 'updateRecommendations').mockRejectedValue(new NotFoundException());

            await expect(
                controller.updateRecommendations('nonexistent-id', recommendationsDto)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('Swagger Documentation', () => {
        it('should have API tags', () => {
            const controllerMetadata = Reflect.getMetadata('swagger/apiUseTags', InterviewReportsController);
            expect(controllerMetadata).toContain('Interview Reports');
        });
    });
});
