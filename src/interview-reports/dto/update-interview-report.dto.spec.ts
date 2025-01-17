import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateInterviewReportDto } from './update-interview-report.dto';

describe('UpdateInterviewReportDto', () => {
    let dto: UpdateInterviewReportDto;

    beforeEach(() => {
        dto = new UpdateInterviewReportDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('inheritance from CreateInterviewReportDto', () => {
        it('should inherit all properties as optional', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {});
            const errors = await validate(updateDto);
            expect(errors).toHaveLength(0);
        });

        it('should validate inherited UUID property when provided', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                interview_id: 'invalid-uuid'
            });
            const errors = await validate(updateDto);
            const interviewIdErrors = errors.filter(error => error.property === 'interview_id');
            expect(interviewIdErrors).toHaveLength(1);
            expect(interviewIdErrors[0].constraints).toHaveProperty('isUuid');
        });

        it('should accept valid inherited UUID', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                interview_id: '123e4567-e89b-12d3-a456-426614174001'
            });
            const errors = await validate(updateDto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('overall_score validation', () => {
        it('should accept a valid number score', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                overall_score: 87.5
            });
            const errors = await validate(updateDto);
            expect(errors).toHaveLength(0);
        });

        it('should accept undefined overall_score', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {});
            const errors = await validate(updateDto);
            expect(errors.filter(error => error.property === 'overall_score')).toHaveLength(0);
        });

        it('should fail when overall_score is not a number', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                overall_score: 'not a number'
            });
            const errors = await validate(updateDto);
            const overallScoreErrors = errors.filter(error => error.property === 'overall_score');
            expect(overallScoreErrors).toHaveLength(1);
            expect(overallScoreErrors[0].constraints).toHaveProperty('isNumber');
        });
    });

    describe('company_report validation', () => {
        it('should accept a valid company report object', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                company_report: {
                    technical_score: 85,
                    communication_score: 90,
                    detailed_feedback: {}
                }
            });
            const errors = await validate(updateDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail when company_report is not an object', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                company_report: 'not an object'
            });
            const errors = await validate(updateDto);
            const companyReportErrors = errors.filter(error => error.property === 'company_report');
            expect(companyReportErrors).toHaveLength(1);
            expect(companyReportErrors[0].constraints).toHaveProperty('isObject');
        });
    });

    describe('candidate_report validation', () => {
        it('should accept a valid candidate report object', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                candidate_report: {
                    overall_performance: 'Excellent',
                    areas_of_improvement: []
                }
            });
            const errors = await validate(updateDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail when candidate_report is not an object', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                candidate_report: 'not an object'
            });
            const errors = await validate(updateDto);
            const candidateReportErrors = errors.filter(error => error.property === 'candidate_report');
            expect(candidateReportErrors).toHaveLength(1);
            expect(candidateReportErrors[0].constraints).toHaveProperty('isObject');
        });
    });

    describe('recommendations validation', () => {
        it('should accept a valid string recommendation', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                recommendations: 'Consider focusing on system design concepts'
            });
            const errors = await validate(updateDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail when recommendations is not a string', async () => {
            const updateDto = plainToInstance(UpdateInterviewReportDto, {
                recommendations: 123
            });
            const errors = await validate(updateDto);
            const recommendationsErrors = errors.filter(error => error.property === 'recommendations');
            expect(recommendationsErrors).toHaveLength(1);
            expect(recommendationsErrors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid update DTO', async () => {
            const completeDto = plainToInstance(UpdateInterviewReportDto, {
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

        it('should validate a partial update with only some fields', async () => {
            const partialDto = plainToInstance(UpdateInterviewReportDto, {
                overall_score: 92.5,
                recommendations: 'Focus on improving API design skills'
            });

            const errors = await validate(partialDto);
            expect(errors).toHaveLength(0);
        });

        it('should validate an empty update DTO', async () => {
            const emptyDto = plainToInstance(UpdateInterviewReportDto, {});
            const errors = await validate(emptyDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with multiple validation errors', async () => {
            const invalidDto = plainToInstance(UpdateInterviewReportDto, {
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

    describe('type checking', () => {
        it('should maintain proper types for inherited properties', () => {
            const updateDto = new UpdateInterviewReportDto();

            // Verificar que las propiedades heredadas son opcionales
            const properties: Partial<UpdateInterviewReportDto> = {
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                company_report: {},
                candidate_report: {},
                overall_score: 87.5,
                recommendations: 'test'
            };

            // Esta asignación debería compilar sin errores
            Object.assign(updateDto, properties);
            expect(updateDto).toBeDefined();
        });
    });
});
