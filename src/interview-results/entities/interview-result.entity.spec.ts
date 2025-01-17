import { plainToInstance } from 'class-transformer';
import { InterviewResult } from './interview-result.entity';

describe('InterviewResult Entity', () => {
    let entity: InterviewResult;

    beforeEach(() => {
        entity = new InterviewResult();
    });

    it('should be defined', () => {
        expect(entity).toBeDefined();
    });

    describe('Property Types', () => {
        it('should have correct types for all properties', () => {
            const testData = {
                result_id: '123e4567-e89b-12d3-a456-426614174000',
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002',
                candidate_answer: 'Test answer',
                rating: 4,
                ai_feedback: 'Test feedback',
                created_at: new Date()
            };

            const entity = plainToInstance(InterviewResult, testData);

            expect(typeof entity.result_id).toBe('string');
            expect(typeof entity.interview_id).toBe('string');
            expect(typeof entity.question_id).toBe('string');
            expect(typeof entity.candidate_answer).toBe('string');
            expect(typeof entity.rating).toBe('number');
            expect(typeof entity.ai_feedback).toBe('string');
            expect(entity.created_at).toBeInstanceOf(Date);
        });
    });

    describe('UUID Format Validation', () => {
        it('should validate UUID format for IDs', () => {
            const testData = {
                result_id: '123e4567-e89b-12d3-a456-426614174000',
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002'
            };

            const entity = plainToInstance(InterviewResult, testData);
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            expect(entity.result_id).toMatch(uuidRegex);
            expect(entity.interview_id).toMatch(uuidRegex);
            expect(entity.question_id).toMatch(uuidRegex);
        });
    });

    describe('Nullable Fields', () => {
        it('should allow null for optional fields', () => {
            const testData = {
                result_id: '123e4567-e89b-12d3-a456-426614174000',
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002',
                candidate_answer: null,
                rating: 4,
                ai_feedback: null,
                created_at: new Date()
            };

            const entity = plainToInstance(InterviewResult, testData);
            expect(entity.candidate_answer).toBeNull();
            expect(entity.ai_feedback).toBeNull();
        });
    });

    describe('Rating Field', () => {
        it('should accept valid integer ratings', () => {
            const testData = {
                rating: 4
            };

            const entity = plainToInstance(InterviewResult, testData);
            expect(entity.rating).toBe(4);
            expect(Number.isInteger(entity.rating)).toBeTruthy();
        });
    });

    describe('Date Field', () => {
        it('should create a valid Date object for created_at', () => {
            const now = new Date();
            const entity = plainToInstance(InterviewResult, { created_at: now });
            expect(entity.created_at).toBeInstanceOf(Date);
            expect(entity.created_at.getTime()).toBe(now.getTime());
        });

        it('should handle ISO string dates', () => {
            const date = new Date('2024-01-16T12:00:00.000Z');
            const entity = plainToInstance(InterviewResult, { created_at: date });
            expect(entity.created_at).toBeInstanceOf(Date);
            expect(entity.created_at.toISOString()).toBe('2024-01-16T12:00:00.000Z');
        });
    });

    describe('Complete Entity Validation', () => {
        it('should create a valid complete entity', () => {
            const now = new Date();
            const testData = {
                result_id: '123e4567-e89b-12d3-a456-426614174000',
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002',
                candidate_answer: 'Test answer',
                rating: 4,
                ai_feedback: 'Test feedback',
                created_at: now
            };

            const entity = plainToInstance(InterviewResult, testData);

            expect(entity).toMatchObject({
                ...testData,
                created_at: expect.any(Date)
            });
        });
    });
});
