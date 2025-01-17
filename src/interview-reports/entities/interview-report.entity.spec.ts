import { ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { InterviewReport } from './interview-report.entity';

describe('InterviewReport Entity', () => {
    let report: InterviewReport;

    beforeEach(() => {
        report = new InterviewReport();
    });

    it('should be defined', () => {
        expect(report).toBeDefined();
    });

    describe('Entity Structure', () => {
        it('should have all required properties', () => {
            const testData = {
                report_id: '123e4567-e89b-12d3-a456-426614174000',
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                company_report: {},
                candidate_report: {},
                overall_score: 87.5,
                recommendations: 'test',
                created_at: new Date()
            };

            const report = plainToInstance(InterviewReport, testData);

            expect(report).toHaveProperty('report_id');
            expect(report).toHaveProperty('interview_id');
            expect(report).toHaveProperty('company_report');
            expect(report).toHaveProperty('candidate_report');
            expect(report).toHaveProperty('overall_score');
            expect(report).toHaveProperty('recommendations');
            expect(report).toHaveProperty('created_at');
        });
    });

    describe('Property Types', () => {
        it('should have correct types for all properties', () => {
            const testData = {
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

            const report = plainToInstance(InterviewReport, testData);

            expect(typeof report.report_id).toBe('string');
            expect(typeof report.interview_id).toBe('string');
            expect(typeof report.company_report).toBe('object');
            expect(typeof report.candidate_report).toBe('object');
            expect(typeof report.overall_score).toBe('number');
            expect(typeof report.recommendations).toBe('string');
            expect(report.created_at).toBeInstanceOf(Date);
        });
    });

    describe('UUID Format', () => {
        it('should validate UUID format for report_id', () => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const testData = {
                report_id: '123e4567-e89b-12d3-a456-426614174000'
            };

            const report = plainToInstance(InterviewReport, testData);
            expect(report.report_id).toMatch(uuidRegex);
        });

        it('should validate UUID format for interview_id', () => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const testData = {
                interview_id: '123e4567-e89b-12d3-a456-426614174001'
            };

            const report = plainToInstance(InterviewReport, testData);
            expect(report.interview_id).toMatch(uuidRegex);
        });
    });

    describe('JSON Fields', () => {
        it('should handle company_report as JSON object', () => {
            const companyReport = {
                technical_score: 85,
                communication_score: 90,
                detailed_feedback: {
                    coding_skills: 'Excellent',
                    problem_solving: 'Good'
                }
            };

            const report = plainToInstance(InterviewReport, { company_report: companyReport });
            expect(report.company_report).toEqual(companyReport);
        });

        it('should handle candidate_report as JSON object', () => {
            const candidateReport = {
                overall_performance: 'Excellent',
                areas_of_improvement: ['System Design', 'Algorithm Optimization']
            };

            const report = plainToInstance(InterviewReport, { candidate_report: candidateReport });
            expect(report.candidate_report).toEqual(candidateReport);
        });

        it('should allow null for optional JSON fields', () => {
            const report = plainToInstance(InterviewReport, {
                company_report: null,
                candidate_report: null
            });

            expect(report.company_report).toBeNull();
            expect(report.candidate_report).toBeNull();
        });
    });

    describe('Numeric Fields', () => {
        it('should handle overall_score as decimal', () => {
            const testScores = [87.5, 90.00, 75.25, 100.00, 0.00];

            testScores.forEach(score => {
                const report = plainToInstance(InterviewReport, { overall_score: score });
                expect(typeof report.overall_score).toBe('number');
                // Verificamos que el número tenga hasta 2 decimales
                const decimalPlaces = (report.overall_score.toString().split('.')[1] || '').length;
                expect(decimalPlaces).toBeLessThanOrEqual(2);
            });
        });
    });

    describe('Text Fields', () => {
        it('should handle recommendations as text', () => {
            const recommendations = 'Consider focusing on system design concepts';
            const report = plainToInstance(InterviewReport, { recommendations });

            expect(report.recommendations).toBe(recommendations);
        });

        it('should allow null for recommendations', () => {
            const report = plainToInstance(InterviewReport, { recommendations: null });
            expect(report.recommendations).toBeNull();
        });
    });

    describe('Date Fields', () => {
        it('should handle created_at as timestamp with time zone', () => {
            const date = new Date('2024-01-16T12:00:00Z');
            const report = plainToInstance(InterviewReport, { created_at: date });

            expect(report.created_at).toBeInstanceOf(Date);
            expect(report.created_at.toISOString()).toBe('2024-01-16T12:00:00.000Z');
        });
    });

    describe('Complete Entity', () => {
        it('should create a complete valid entity', () => {
            const testData = {
                report_id: '123e4567-e89b-12d3-a456-426614174000',
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                company_report: {
                    technical_score: 85,
                    communication_score: 90,
                    detailed_feedback: {
                        coding_skills: 'Excellent',
                        problem_solving: 'Good'
                    }
                },
                candidate_report: {
                    overall_performance: 'Excellent',
                    areas_of_improvement: ['System Design', 'Algorithm Optimization']
                },
                overall_score: 87.5,
                recommendations: 'Consider focusing on system design concepts',
                created_at: new Date('2024-01-16T12:00:00Z')
            };

            const report = plainToInstance(InterviewReport, testData);

            // Verificar cada propiedad individualmente
            expect(report.report_id).toBe(testData.report_id);
            expect(report.interview_id).toBe(testData.interview_id);
            expect(report.company_report).toEqual(testData.company_report);
            expect(report.candidate_report).toEqual(testData.candidate_report);
            expect(report.overall_score).toBe(testData.overall_score);
            expect(report.recommendations).toBe(testData.recommendations);
            expect(report.created_at).toEqual(testData.created_at);
        });
    });
});
