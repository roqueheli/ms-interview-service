import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateQuestionDto } from './update-question.dto';

describe('UpdateQuestionDto', () => {
    it('should be defined', () => {
        const dto = new UpdateQuestionDto();
        expect(dto).toBeDefined();
    });

    describe('partial validation', () => {
        it('should validate with all properties', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001',
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                question_text: 'What is dependency injection?',
                expected_answer: 'Dependency injection is a design pattern...',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only job_role_id', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                job_role_id: '123e4567-e89b-12d3-a456-426614174001'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only seniority_id', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                seniority_id: '123e4567-e89b-12d3-a456-426614174002'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only question_text', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                question_text: 'What is dependency injection?'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only expected_answer', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                expected_answer: 'Dependency injection is a design pattern...'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate with only complexity_level', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('property validation', () => {
        it('should fail with invalid job_role_id', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                job_role_id: 'invalid-uuid'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail with invalid seniority_id', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                seniority_id: 'invalid-uuid'
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail with non-string question_text', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                question_text: 123
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail with non-string expected_answer', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                expected_answer: 123
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail with complexity_level less than 1', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                complexity_level: 0
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with complexity_level greater than 5', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                complexity_level: 6
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should fail with non-integer complexity_level', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                complexity_level: 3.5
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('multiple properties validation', () => {
        it('should validate with some properties', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                question_text: 'What is dependency injection?',
                complexity_level: 3
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should validate with different combinations of properties', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                seniority_id: '123e4567-e89b-12d3-a456-426614174002',
                expected_answer: 'Dependency injection is a design pattern...',
                complexity_level: 4
            });

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });

        it('should fail with multiple invalid properties', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {
                job_role_id: 'invalid-uuid',
                complexity_level: 6,
                question_text: 123
            });

            const errors = await validate(testDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.length).toBe(3); // Debería haber un error por cada propiedad inválida
        });
    });

    describe('empty object validation', () => {
        it('should validate an empty update object', async () => {
            const testDto = plainToInstance(UpdateQuestionDto, {});

            const errors = await validate(testDto);
            expect(errors.length).toBe(0);
        });
    });
});
