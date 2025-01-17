import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateInterviewResultDto } from './update-interview-result.dto';

describe('UpdateInterviewResultDto', () => {
    let dto: UpdateInterviewResultDto;

    beforeEach(() => {
        dto = new UpdateInterviewResultDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('inheritance from CreateInterviewResultDto', () => {
        it('should make all inherited properties optional', async () => {
            const dto = plainToInstance(UpdateInterviewResultDto, {});
            const errors = await validate(dto);

            // No validation errors should occur for missing properties since they're all optional
            expect(errors.filter(error =>
                ['interview_id', 'question_id', 'candidate_answer', 'ai_feedback'].includes(error.property)
            )).toHaveLength(0);
        });

        it('should still validate inherited properties if provided', async () => {
            const dto = plainToInstance(UpdateInterviewResultDto, {
                interview_id: 'invalid-uuid',
                candidate_answer: 123, // should be string
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(error => error.property === 'interview_id')).toBeTruthy();
            expect(errors.some(error => error.property === 'candidate_answer')).toBeTruthy();
        });
    });

    describe('rating validation', () => {
        it('should validate when rating is undefined', async () => {
            const dto = plainToInstance(UpdateInterviewResultDto, {});
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'rating')).toHaveLength(0);
        });

        it('should validate when rating is a valid integer between 1 and 5', async () => {
            dto.rating = 4;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'rating')).toHaveLength(0);
        });

        it('should validate when rating is minimum allowed value (1)', async () => {
            dto.rating = 1;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'rating')).toHaveLength(0);
        });

        it('should validate when rating is maximum allowed value (5)', async () => {
            dto.rating = 5;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'rating')).toHaveLength(0);
        });

        it('should fail when rating is less than minimum (1)', async () => {
            dto.rating = 0;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('min');
        });

        it('should fail when rating is greater than maximum (5)', async () => {
            dto.rating = 6;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('max');
        });

        it('should fail when rating is not an integer', async () => {
            dto.rating = 3.5;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO', async () => {
            const validDto = plainToInstance(UpdateInterviewResultDto, {
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002',
                candidate_answer: 'Valid answer',
                rating: 4,
                ai_feedback: 'Good understanding shown'
            });

            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should validate a partial valid DTO', async () => {
            const validDto = plainToInstance(UpdateInterviewResultDto, {
                rating: 4,
                ai_feedback: 'Good understanding shown'
            });

            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should validate an empty DTO', async () => {
            const validDto = plainToInstance(UpdateInterviewResultDto, {});
            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with invalid values while allowing valid ones', async () => {
            const dto = plainToInstance(UpdateInterviewResultDto, {
                interview_id: 'invalid-uuid',
                rating: 6,
                ai_feedback: 'Valid feedback'
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(2);
            expect(errors.some(error => error.property === 'interview_id')).toBeTruthy();
            expect(errors.some(error => error.property === 'rating')).toBeTruthy();
        });
    });
});
