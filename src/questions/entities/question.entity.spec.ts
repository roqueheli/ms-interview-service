import { plainToInstance } from 'class-transformer';
import { Question } from './question.entity';

describe('Question Entity', () => {
    let question: Question;

    beforeEach(() => {
        question = new Question();
    });

    it('should be defined', () => {
        expect(question).toBeDefined();
    });

    describe('Property Types', () => {
        beforeEach(() => {
            question = plainToInstance(Question, {
                question_id: '123e4567-e89b-12d3-a456-426614174000',
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                expected_answer: 'Dependency injection is a design pattern...',
                complexity_level: 3,
                created_at: new Date('2024-01-16T12:00:00Z')
            });
        });

        it('should have UUID type for question_id', () => {
            expect(typeof question.question_id).toBe('string');
            expect(question.question_id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
        });

        it('should have UUID type for job_role_id', () => {
            expect(typeof question.job_role_id).toBe('string');
            expect(question.job_role_id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
        });

        it('should have UUID type for seniority_id', () => {
            expect(typeof question.seniority_id).toBe('string');
            expect(question.seniority_id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
        });

        it('should have string type for question_text', () => {
            expect(typeof question.question_text).toBe('string');
        });

        it('should have string type or null for expected_answer', () => {
            expect(typeof question.expected_answer).toBe('string');

            const questionWithNullAnswer = plainToInstance(Question, {
                ...question,
                expected_answer: null
            });
            expect(questionWithNullAnswer.expected_answer).toBeNull();
        });

        it('should have number type for complexity_level', () => {
            expect(typeof question.complexity_level).toBe('number');
            expect(Number.isInteger(question.complexity_level)).toBe(true);
        });

        it('should have Date type for created_at', () => {
            expect(question.created_at).toBeInstanceOf(Date);
        });
    });

    describe('Property Values', () => {
        it('should accept valid complexity levels between 1 and 5', () => {
            const validLevels = [1, 2, 3, 4, 5];

            validLevels.forEach(level => {
                question.complexity_level = level;
                expect(question.complexity_level).toBe(level);
            });
        });

        it('should handle empty expected_answer', () => {
            question.expected_answer = null;
            expect(question.expected_answer).toBeNull();
        });

        it('should handle long question texts', () => {
            const longText = 'A'.repeat(1000);
            question.question_text = longText;
            expect(question.question_text).toBe(longText);
        });

        it('should handle long expected answers', () => {
            const longAnswer = 'A'.repeat(1000);
            question.expected_answer = longAnswer;
            expect(question.expected_answer).toBe(longAnswer);
        });
    });

    describe('Date Handling', () => {
        it('should handle created_at date assignment', () => {
            const testDate = new Date('2024-01-16T12:00:00Z');
            question.created_at = testDate;
            expect(question.created_at).toEqual(testDate);
        });

        it('should preserve timezone information', () => {
            const testDate = new Date('2024-01-16T12:00:00Z');
            question.created_at = testDate;
            expect(question.created_at.toISOString()).toBe('2024-01-16T12:00:00.000Z');
        });
    });

    describe('Entity Transformation', () => {
        it('should transform plain object to Question instance', () => {
            const plainObject = {
                question_id: '123e4567-e89b-12d3-a456-426614174000',
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                expected_answer: 'Dependency injection is a design pattern...',
                complexity_level: 3,
                created_at: new Date('2024-01-16T12:00:00Z')
            };

            const questionInstance = plainToInstance(Question, plainObject);
            expect(questionInstance).toBeInstanceOf(Question);
            expect(questionInstance).toEqual(expect.objectContaining(plainObject));
        });

        it('should handle partial object transformation', () => {
            const partialObject = {
                question_text: 'What is dependency injection?',
                complexity_level: 3
            };

            const questionInstance = plainToInstance(Question, partialObject);
            expect(questionInstance).toBeInstanceOf(Question);
            expect(questionInstance.question_text).toBe(partialObject.question_text);
            expect(questionInstance.complexity_level).toBe(partialObject.complexity_level);
        });
    });
});
