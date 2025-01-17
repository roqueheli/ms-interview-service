import { validate } from 'class-validator';
import { InterviewStatus } from '../entities/interview.entity';
import { UpdateInterviewDto } from './update-interview.dto';

describe('UpdateInterviewDto', () => {
    let dto: UpdateInterviewDto;

    beforeEach(() => {
        dto = new UpdateInterviewDto();
    });

    describe('inheritance', () => {
        it('should inherit all properties from CreateInterviewDto as optional', async () => {
            const dto = new UpdateInterviewDto();

            // Validar que un objeto vacío sea válido (todas las propiedades son opcionales)
            const errors = await validate(dto);
            expect(errors.length).toBe(0);

            // Validar que las propiedades heredadas sean válidas si se proporcionan
            dto.application_id = '123e4567-e89b-12d3-a456-426614174001';
            dto.config_id = '123e4567-e89b-12d3-a456-426614174002';
            dto.status = InterviewStatus.PENDING;
            dto.scheduled_date = '2024-01-16T12:00:00Z' as any;
            dto.expiration_date = '2024-01-17T12:00:00Z' as any;
            dto.video_recording_url = 'https://example.com/video.mp4';

            const errorsWithValues = await validate(dto);
            expect(errorsWithValues.length).toBe(0);
        });
    });

    describe('validation', () => {
        it('should validate with empty object (all properties optional)', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with valid UUID for application_id', async () => {
            dto.application_id = '123e4567-e89b-12d3-a456-426614174001';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with valid UUID for config_id', async () => {
            dto.config_id = '123e4567-e89b-12d3-a456-426614174002';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with valid status', async () => {
            dto.status = InterviewStatus.PENDING;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with valid scheduled_date', async () => {
            dto.scheduled_date = '2024-01-16T12:00:00Z' as any;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with valid expiration_date', async () => {
            dto.expiration_date = '2024-01-17T12:00:00Z' as any;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should validate with valid video_recording_url', async () => {
            dto.video_recording_url = 'https://example.com/video.mp4';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('invalid values', () => {
        it('should fail with invalid UUID for application_id', async () => {
            dto.application_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail with invalid UUID for config_id', async () => {
            dto.config_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail with invalid status', async () => {
            (dto as any).status = 'INVALID_STATUS';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isEnum');
        });

        it('should fail with invalid scheduled_date', async () => {
            dto.scheduled_date = 'invalid-date' as any;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });

        it('should fail with invalid expiration_date', async () => {
            dto.expiration_date = 'invalid-date' as any;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });

        it('should fail with invalid video_recording_url', async () => {
            dto.video_recording_url = 'not-a-url';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUrl');
        });
    });

    describe('partial updates', () => {
        it('should allow updating only status', async () => {
            dto.status = InterviewStatus.IN_PROGRESS;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should allow updating multiple fields', async () => {
            dto.status = InterviewStatus.COMPLETED;
            dto.video_recording_url = 'https://example.com/updated-video.mp4';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });
});
