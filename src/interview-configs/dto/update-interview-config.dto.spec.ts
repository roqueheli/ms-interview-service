import { validate } from 'class-validator';
import { UpdateInterviewConfigDto } from './update-interview-config.dto';

describe('UpdateInterviewConfigDto', () => {
    let dto: UpdateInterviewConfigDto;

    beforeEach(() => {
        dto = new UpdateInterviewConfigDto();
    });

    it('should pass validation with empty object (all fields optional)', async () => {
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass validation with all valid fields', async () => {
        Object.assign(dto, {
            enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
            job_role_id: '123e4567-e89b-12d3-a456-426614174002',
            seniority_id: '123e4567-e89b-12d3-a456-426614174003',
            duration_minutes: 60,
            num_questions: 10,
            complexity_level: 3,
            validity_hours: 24,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass validation with partial valid fields', async () => {
        Object.assign(dto, {
            duration_minutes: 45,
            complexity_level: 4,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    describe('UUID validations', () => {
        it('should fail with invalid enterprise_id if provided', async () => {
            dto.enterprise_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail with invalid job_role_id if provided', async () => {
            dto.job_role_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail with invalid seniority_id if provided', async () => {
            dto.seniority_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('numeric validations', () => {
        it('should fail with invalid duration_minutes if provided', async () => {
            dto.duration_minutes = 0;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with invalid num_questions if provided', async () => {
            dto.num_questions = -1;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail with complexity_level out of range if provided', async () => {
            dto.complexity_level = 6;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should fail with invalid validity_hours if provided', async () => {
            dto.validity_hours = 0;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('min');
        });
    });

    describe('type validations', () => {
        it('should fail with incorrect types if provided', async () => {
            Object.assign(dto, {
                duration_minutes: '60', // should be number
                num_questions: '10', // should be number
                complexity_level: '3', // should be number
                validity_hours: '24', // should be number
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('mixed valid and invalid fields', () => {
        it('should fail with mix of valid and invalid fields', async () => {
            Object.assign(dto, {
                enterprise_id: '123e4567-e89b-12d3-a456-426614174001', // valid
                duration_minutes: 0, // invalid
                complexity_level: 3, // valid
                validity_hours: -1, // invalid
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(2); // Should have errors for duration_minutes and validity_hours
        });
    });
});