import { validate } from 'class-validator';
import { CreateInterviewConfigDto } from './create-interview-config.dto';

describe('CreateInterviewConfigDto', () => {
    let dto: CreateInterviewConfigDto;

    beforeEach(() => {
        // Crear una instancia válida del DTO antes de cada prueba
        dto = new CreateInterviewConfigDto();
        dto.enterprise_id = '123e4567-e89b-12d3-a456-426614174001';
        dto.job_role_id = '123e4567-e89b-12d3-a456-426614174002';
        dto.seniority_id = '123e4567-e89b-12d3-a456-426614174003';
        dto.duration_minutes = 60;
        dto.num_questions = 10;
        dto.complexity_level = 3;
        dto.validity_hours = 24;
    });

    it('should validate a correct DTO', async () => {
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    describe('enterprise_id validation', () => {
        it('should fail with invalid UUID', async () => {
            dto.enterprise_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when empty', async () => {
            dto.enterprise_id = '';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('job_role_id validation', () => {
        it('should fail with invalid UUID', async () => {
            dto.job_role_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when empty', async () => {
            dto.job_role_id = '';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('seniority_id validation', () => {
        it('should fail with invalid UUID', async () => {
            dto.seniority_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when empty', async () => {
            dto.seniority_id = '';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('duration_minutes validation', () => {
        it('should fail with zero', async () => {
            dto.duration_minutes = 0;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with negative number', async () => {
            dto.duration_minutes = -1;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with decimal number', async () => {
            dto.duration_minutes = 30.5;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('num_questions validation', () => {
        it('should fail with zero', async () => {
            dto.num_questions = 0;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with negative number', async () => {
            dto.num_questions = -1;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with decimal number', async () => {
            dto.num_questions = 5.5;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('complexity_level validation', () => {
        it('should fail with zero', async () => {
            dto.complexity_level = 0;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with number greater than 5', async () => {
            dto.complexity_level = 6;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should fail with decimal number', async () => {
            dto.complexity_level = 3.5;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should pass with numbers 1 through 5', async () => {
            for (let i = 1; i <= 5; i++) {
                dto.complexity_level = i;
                const errors = await validate(dto);
                expect(errors.length).toBe(0);
            }
        });
    });

    describe('validity_hours validation', () => {
        it('should fail with zero', async () => {
            dto.validity_hours = 0;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with negative number', async () => {
            dto.validity_hours = -1;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with decimal number', async () => {
            dto.validity_hours = 12.5;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('type validation', () => {
        it('should fail when properties have incorrect types', async () => {
            const invalidDto = {
                enterprise_id: 123, // should be string
                job_role_id: true, // should be string
                seniority_id: {}, // should be string
                duration_minutes: '60', // should be number
                num_questions: '10', // should be number
                complexity_level: '3', // should be number
                validity_hours: '24', // should be number
            };

            const dto = new CreateInterviewConfigDto();
            Object.assign(dto, invalidDto);

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });
    });
});