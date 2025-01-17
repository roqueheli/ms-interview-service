import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateInterviewResultDto } from './create-interview-result.dto';

describe('CreateInterviewResultDto', () => {
    let dto: CreateInterviewResultDto;

    beforeEach(() => {
        dto = new CreateInterviewResultDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('interview_id validation', () => {
        it('should validate a correct UUID', async () => {
            dto.interview_id = '123e4567-e89b-12d3-a456-426614174001';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'interview_id')).toHaveLength(0);
        });

        it('should fail with an invalid UUID', async () => {
            dto.interview_id = 'invalid-uuid';
            const errors = await validate(dto);
            const interviewIdErrors = errors.filter(error => error.property === 'interview_id');
            expect(interviewIdErrors).toHaveLength(1);
            expect(interviewIdErrors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when interview_id is missing', async () => {
            const errors = await validate(dto);
            const interviewIdErrors = errors.filter(error => error.property === 'interview_id');
            expect(interviewIdErrors).toHaveLength(1);
        });
    });

    describe('question_id validation', () => {
        it('should validate a correct UUID', async () => {
            dto.question_id = '123e4567-e89b-12d3-a456-426614174002';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'question_id')).toHaveLength(0);
        });

        it('should fail with an invalid UUID', async () => {
            dto.question_id = 'invalid-uuid';
            const errors = await validate(dto);
            const questionIdErrors = errors.filter(error => error.property === 'question_id');
            expect(questionIdErrors).toHaveLength(1);
            expect(questionIdErrors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when question_id is missing', async () => {
            const errors = await validate(dto);
            const questionIdErrors = errors.filter(error => error.property === 'question_id');
            expect(questionIdErrors).toHaveLength(1);
        });
    });

    describe('candidate_answer validation', () => {
        it('should validate when candidate_answer is a string', async () => {
            dto.candidate_answer = 'This is a valid answer';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'candidate_answer')).toHaveLength(0);
        });

        it('should validate when candidate_answer is undefined', async () => {
            dto.candidate_answer = undefined;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'candidate_answer')).toHaveLength(0);
        });

        it('should fail when candidate_answer is not a string', async () => {
            (dto as any).candidate_answer = 123;
            const errors = await validate(dto);
            const answerErrors = errors.filter(error => error.property === 'candidate_answer');
            expect(answerErrors).toHaveLength(1);
            expect(answerErrors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('rating validation', () => {
        it('should validate when rating is between 1 and 5', async () => {
            dto.rating = 4;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'rating')).toHaveLength(0);
        });

        it('should fail when rating is less than 1', async () => {
            dto.rating = 0;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('min');
        });

        it('should fail when rating is greater than 5', async () => {
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

        it('should fail when rating is missing', async () => {
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
        });
    });

    describe('ai_feedback validation', () => {
        it('should validate when ai_feedback is a string', async () => {
            dto.ai_feedback = 'This is valid feedback';
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'ai_feedback')).toHaveLength(0);
        });

        it('should validate when ai_feedback is undefined', async () => {
            dto.ai_feedback = undefined;
            const errors = await validate(dto);
            expect(errors.filter(error => error.property === 'ai_feedback')).toHaveLength(0);
        });

        it('should fail when ai_feedback is not a string', async () => {
            (dto as any).ai_feedback = 123;
            const errors = await validate(dto);
            const feedbackErrors = errors.filter(error => error.property === 'ai_feedback');
            expect(feedbackErrors).toHaveLength(1);
            expect(feedbackErrors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO', async () => {
            const validDto = plainToInstance(CreateInterviewResultDto, {
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002',
                candidate_answer: 'This is a valid answer',
                rating: 4,
                ai_feedback: 'Good understanding shown'
            });

            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should validate a minimal valid DTO', async () => {
            const validDto = plainToInstance(CreateInterviewResultDto, {
                interview_id: '123e4567-e89b-12d3-a456-426614174001',
                question_id: '123e4567-e89b-12d3-a456-426614174002',
                rating: 4
            });

            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with multiple invalid fields', async () => {
            const invalidDto = plainToInstance(CreateInterviewResultDto, {
                interview_id: 'invalid-uuid',
                question_id: 'invalid-uuid',
                candidate_answer: 123,
                rating: 6,
                ai_feedback: 456
            });

            const errors = await validate(invalidDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.map(error => error.property)).toEqual(
                expect.arrayContaining(['interview_id', 'question_id', 'candidate_answer', 'rating', 'ai_feedback'])
            );
        });
    });
});
