import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateInterviewReportDto } from './create-interview-report.dto';

describe('CreateInterviewReportDto', () => {
    let dto: CreateInterviewReportDto;

    beforeEach(() => {
        dto = new CreateInterviewReportDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('interview_id validation', () => {
        it('should validate a correct UUID', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'interview_id')).toHaveLength(0);
        });

        it('should fail with an invalid UUID', async () => {
            dto.interview_id = 'invalid-uuid';
            const errors = await validate(dto);
            const interviewIdErrors = errors.filter(error => error.property === 'interview_id');
            expect(interviewIdErrors).toHaveLength(1);
            expect(interviewIdErrors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when interview_id is missing', async () => {
            const errors = await validate(dto);
            const interviewIdErrors = errors.filter(error => error.property === 'interview_id');
            expect(interviewIdErrors).toHaveLength(1);
        });
    });

    describe('company_report validation', () => {
        it('should accept a valid company report object', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.company_report = {
                technical_score: 85,
                communication_score: 90,
                detailed_feedback: {}
            };
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'company_report')).toHaveLength(0);
        });

        it('should accept undefined company report as it is optional', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 87.5;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'company_report')).toHaveLength(0);
        });

        it('should fail when company_report is not an object', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.company_report = 'not an object' as any;
            const errors = await validate(dto);
            const companyReportErrors = errors.filter(error => error.property === 'company_report');
            expect(companyReportErrors).toHaveLength(1);
            expect(companyReportErrors[0].constraints).toHaveProperty('isObject');
        });
    });

    describe('candidate_report validation', () => {
        it('should accept a valid candidate report object', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.candidate_report = {
                overall_performance: 'Excellent',
                areas_of_improvement: []
            };
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'candidate_report')).toHaveLength(0);
        });

        it('should accept undefined candidate report as it is optional', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 87.5;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'candidate_report')).toHaveLength(0);
        });

        it('should fail when candidate_report is not an object', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.candidate_report = 'not an object' as any;
            const errors = await validate(dto);
            const candidateReportErrors = errors.filter(error => error.property === 'candidate_report');
            expect(candidateReportErrors).toHaveLength(1);
            expect(candidateReportErrors[0].constraints).toHaveProperty('isObject');
        });
    });

    describe('overall_score validation', () => {
        it('should accept a valid number score', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 87.5;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'overall_score')).toHaveLength(0);
        });

        it('should fail when overall_score is missing', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            const errors = await validate(dto);
            const overallScoreErrors = errors.filter(error => error.property === 'overall_score');
            expect(overallScoreErrors).toHaveLength(1);
        });

        it('should fail when overall_score is not a number', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 'not a number' as any;
            const errors = await validate(dto);
            const overallScoreErrors = errors.filter(error => error.property === 'overall_score');
            expect(overallScoreErrors).toHaveLength(1);
            expect(overallScoreErrors[0].constraints).toHaveProperty('isNumber');
        });
    });

    describe('recommendations validation', () => {
        it('should accept a valid string recommendation', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 87.5;
            dto.recommendations = 'Consider focusing on system design concepts';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'recommendations')).toHaveLength(0);
        });

        it('should accept undefined recommendations as it is optional', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 87.5;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'recommendations')).toHaveLength(0);
        });

        it('should fail when recommendations is not a string', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.overall_score = 87.5;
            dto.recommendations = 123 as any;
            const errors = await validate(dto);
            const recommendationsErrors = errors.filter(error => error.property === 'recommendations');
            expect(recommendationsErrors).toHaveLength(1);
            expect(recommendationsErrors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO', async () => {
            const completeDto = plainToInstance(CreateInterviewReportDto, {
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
                recommendations: 'Consider focusing on system design concepts'
            });

            const errors = await validate(completeDto);
            expect(errors).toHaveLength(0);
        });

        it('should validate a minimal valid DTO', async () => {
            const minimalDto = plainToInstance(CreateInterviewReportDto, {
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                overall_score: 87.5
            });

            const errors = await validate(minimalDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with multiple validation errors', async () => {
            const invalidDto = plainToInstance(CreateInterviewReportDto, {
                interview_id: 'invalid-uuid',
                company_report: 'not an object',
                candidate_report: 123,
                overall_score: 'not a number',
                recommendations: 456
            });

            const errors = await validate(invalidDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.map(error => error.property)).toEqual(
                expect.arrayContaining([
                    'interview_id',
                    'company_report',
                    'candidate_report',
                    'overall_score',
                    'recommendations'
                ])
            );
        });
    });
});
