import { validate } from 'class-validator';
import { UpdateInterviewFeedbackDto } from './update-interview-feedback.dto';
import { plainToInstance } from 'class-transformer';

describe('UpdateInterviewFeedbackDto', () => {
    let dto: UpdateInterviewFeedbackDto;

    beforeEach(() => {
        dto = new UpdateInterviewFeedbackDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('ai_feedback validation', () => {
        it('should validate when ai_feedback is a valid string', async () => {
            dto.ai_feedback = 'The candidate showed good understanding of core concepts.';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'ai_feedback')).toHaveLength(0);
        });

        it('should fail when ai_feedback is missing', async () => {
            const errors = await validate(dto);
            const feedbackErrors = errors.filter(error => error.property === 'ai_feedback');
            expect(feedbackErrors).toHaveLength(1);
            expect(feedbackErrors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when ai_feedback is not a string', async () => {
            (dto as any).ai_feedback = 12345;
            const errors = await validate(dto);
            const feedbackErrors = errors.filter(error => error.property === 'ai_feedback');
            expect(feedbackErrors).toHaveLength(1);
            expect(feedbackErrors[0].constraints).toHaveProperty('isString');
        });

        it('should fail when ai_feedback exceeds the maximum length', async () => {
            dto.ai_feedback = 'a'.repeat(1001); // 1001 characters
            const errors = await validate(dto);
            const feedbackErrors = errors.filter(error => error.property === 'ai_feedback');
            expect(feedbackErrors).toHaveLength(1);
            expect(feedbackErrors[0].constraints).toHaveProperty('maxLength');
        });

        it('should validate when ai_feedback is exactly at the maximum length', async () => {
            dto.ai_feedback = 'a'.repeat(1000); // 1000 characters
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'ai_feedback')).toHaveLength(0);
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO', async () => {
            const validDto = plainToInstance(UpdateInterviewFeedbackDto, {
                ai_feedback: 'The candidate showed good understanding of core concepts.',
            });

            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with an invalid DTO', async () => {
            const invalidDto = plainToInstance(UpdateInterviewFeedbackDto, {
                ai_feedback: 12345, // Invalid type
            });

            const errors = await validate(invalidDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('ai_feedback');
            expect(errors[0].constraints).toHaveProperty('isString');
        });
    });
});
