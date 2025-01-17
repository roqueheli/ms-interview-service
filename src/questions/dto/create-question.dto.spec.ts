import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

describe('CreateQuestionDto', () => {
    let dto: CreateQuestionDto;

    beforeEach(() => {
        dto = new CreateQuestionDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('job_role_id validation', () => {
        it('should validate a correct UUID', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should fail with an invalid UUID', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: 'invalid-uuid',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when job_role_id is missing', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('seniority_id validation', () => {
        it('should validate a correct UUID', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should fail with an invalid UUID', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: 'invalid-uuid',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when seniority_id is missing', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('question_text validation', () => {
        it('should validate a correct question text', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when question_text is missing', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail when question_text is not a string', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 123,
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('expected_answer validation', () => {
        it('should validate when expected_answer is provided', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                expected_answer: 'Dependency injection is a design pattern...',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate when expected_answer is omitted', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when expected_answer is not a string', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                expected_answer: 123,
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('complexity_level validation', () => {
        it('should validate when complexity_level is between 1 and 5', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when complexity_level is less than 1', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 0
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail when complexity_level is greater than 5', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 6
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should fail when complexity_level is not an integer', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                complexity_level: 3.5
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should fail when complexity_level is missing', async () => {
            const testDto = plainToInstance(CreateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });
});
