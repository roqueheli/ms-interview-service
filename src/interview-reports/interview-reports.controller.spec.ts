import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
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
    let reportClient: ClientProxy;

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

    const mockReportClient = {
        send: jest.fn(() => of(true)),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewReportsController],
            providers: [
                {
                    provide: InterviewReportsService,
                    useValue: mockService
                },
                {
                    provide: 'INTERVIEW_REPORT_SERVICE',
                    useValue: mockReportClient
                }
            ]
        }).compile();

        controller = module.get<InterviewReportsController>(InterviewReportsController);
        service = module.get<InterviewReportsService>(InterviewReportsService);
        reportClient = module.get<ClientProxy>('INTERVIEW_REPORT_SERVICE');

        // Espiar las funciones del cliente Redis
        jest.spyOn(reportClient, 'send');
        jest.spyOn(reportClient, 'emit');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto: CreateInterviewReportDto = {
            interview_id: mockReport.interview_id,
            company_report: mockReport.company_report,
            candidate_report: mockReport.candidate_report,
            overall_score: mockReport.overall_score,
            recommendations: mockReport.recommendations
        };

        it('should create a new interview report and emit event', async () => {
            mockService.create.mockResolvedValue(mockReport);
            mockReportClient.send.mockReturnValue(of(true));

            const result = await controller.create(createDto);

            expect(result).toEqual(mockReport);
            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(reportClient.send).toHaveBeenCalledWith('verify_interview', createDto.interview_id);
            expect(reportClient.emit).toHaveBeenCalledWith('interview_report_created', expect.any(Object));
        });

        it('should throw error if interview does not exist', async () => {
            mockReportClient.send.mockReturnValue(of(false));

            await expect(controller.create(createDto)).rejects.toThrow('Interview not found');
        });
    });

    describe('findByInterview', () => {
        it('should return reports for a specific interview after verification', async () => {
            const reports = [mockReport];
            mockService.findByInterview.mockResolvedValue(reports);
            mockReportClient.send.mockReturnValue(of(true));

            const result = await controller.findByInterview(mockReport.interview_id);

            expect(result).toEqual(reports);
            expect(reportClient.send).toHaveBeenCalledWith('verify_interview', mockReport.interview_id);
            expect(service.findByInterview).toHaveBeenCalledWith(mockReport.interview_id);
        });

        it('should throw error if interview does not exist', async () => {
            mockReportClient.send.mockReturnValue(of(false));

            await expect(controller.findByInterview('nonexistent-id'))
                .rejects.toThrow('Interview not found');
        });
    });

    describe('update', () => {
        const updateDto: UpdateInterviewReportDto = {
            company_report: { technical_score: 90 }
        };

        it('should update report and emit event', async () => {
            const updatedReport = { ...mockReport, company_report: { ...mockReport.company_report, technical_score: 90 } };
            mockService.update.mockResolvedValue(updatedReport);

            const result = await controller.update(mockReport.report_id, updateDto);

            expect(result).toEqual(updatedReport);
            expect(service.update).toHaveBeenCalledWith(mockReport.report_id, updateDto);
            expect(reportClient.emit).toHaveBeenCalledWith('interview_report_updated', expect.any(Object));
        });
    });

    describe('remove', () => {
        it('should remove report and emit event', async () => {
            mockService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(mockReport.report_id);

            expect(result).toEqual({ message: 'Interview report deleted successfully' });
            expect(service.remove).toHaveBeenCalledWith(mockReport.report_id);
            expect(reportClient.emit).toHaveBeenCalledWith('interview_report_deleted', expect.any(Object));
        });
    });

    describe('updateOverallScore', () => {
        const scoreDto: UpdateOverallScoreDto = { overall_score: 95.0 };

        it('should update score and emit event', async () => {
            const updatedReport = { ...mockReport, overall_score: 95.0 };
            mockService.updateOverallScore.mockResolvedValue(updatedReport);

            const result = await controller.updateOverallScore(mockReport.report_id, scoreDto);

            expect(result).toEqual(updatedReport);
            expect(service.updateOverallScore).toHaveBeenCalledWith(mockReport.report_id, scoreDto.overall_score);
            expect(reportClient.emit).toHaveBeenCalledWith('interview_report_score_updated', expect.any(Object));
        });
    });

    describe('updateRecommendations', () => {
        const recommendationsDto: UpdateRecommendationsDto = {
            recommendations: 'New recommendations'
        };

        it('should update recommendations and emit event', async () => {
            const updatedReport = { ...mockReport, recommendations: 'New recommendations' };
            mockService.updateRecommendations.mockResolvedValue(updatedReport);

            const result = await controller.updateRecommendations(mockReport.report_id, recommendationsDto);

            expect(result).toEqual(updatedReport);
            expect(service.updateRecommendations).toHaveBeenCalledWith(
                mockReport.report_id,
                recommendationsDto.recommendations
            );
            expect(reportClient.emit).toHaveBeenCalledWith(
                'interview_report_recommendations_updated',
                expect.any(Object)
            );
        });
    });

    describe('Message Patterns', () => {
        describe('verifyReport', () => {
            it('should return true if report exists', async () => {
                mockService.findOne.mockResolvedValue(mockReport);

                const result = await controller.verifyReport(mockReport.report_id);

                expect(result).toEqual({ exists: true });
            });

            it('should return false if report does not exist', async () => {
                mockService.findOne.mockRejectedValue(new NotFoundException());

                const result = await controller.verifyReport('nonexistent-id');

                expect(result).toEqual({ exists: false });
            });
        });
    });

    // Mantener las pruebas existentes para findAll y findOne
    describe('findAll', () => {
        it('should return an array of interview reports', async () => {
            const reports = [mockReport];
            mockService.findAll.mockResolvedValue(reports);

            const result = await controller.findAll();

            expect(result).toEqual(reports);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single interview report', async () => {
            mockService.findOne.mockResolvedValue(mockReport);

            const result = await controller.findOne(mockReport.report_id);

            expect(result).toEqual(mockReport);
            expect(service.findOne).toHaveBeenCalledWith(mockReport.report_id);
        });
    });
});
