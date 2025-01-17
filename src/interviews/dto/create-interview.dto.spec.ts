import { validate } from 'class-validator';
import { CreateInterviewDto } from './create-interview.dto';
import { InterviewStatus } from '../entities/interview.entity';
import { plainToInstance } from 'class-transformer';

describe('CreateInterviewDto', () => {
    let dto: CreateInterviewDto;

    beforeEach(() => {
        dto = new CreateInterviewDto();
        dto.application_id = '123e4567-e89b-12d3-a456-426614174001';
        dto.config_id = '123e4567-e89b-12d3-a456-426614174002';
        dto.expiration_date = '2024-01-17T12:00:00Z' as any; // ISO string
    });

    describe('application_id', () => {
        it('should validate a valid UUID', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with an invalid UUID', async () => {
            dto.application_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when application_id is missing', async () => {
            dto.application_id = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('config_id', () => {
        it('should validate a valid UUID', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with an invalid UUID', async () => {
            dto.config_id = 'invalid-uuid';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail when config_id is missing', async () => {
            dto.config_id = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });

    describe('status', () => {
        it('should accept valid status', async () => {
            dto.status = InterviewStatus.PENDING;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should accept undefined status (optional)', async () => {
            dto.status = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid status', async () => {
            (dto as any).status = 'INVALID_STATUS';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isEnum');
        });
    });

    describe('scheduled_date', () => {
        it('should accept valid date string', async () => {
            dto.scheduled_date = '2024-01-16T12:00:00Z' as any; // ISO string
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should accept undefined scheduled_date (optional)', async () => {
            dto.scheduled_date = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid date string', async () => {
            (dto as any).scheduled_date = 'invalid-date';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });
    });

    describe('expiration_date', () => {
        it('should accept valid date string', async () => {
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid date string', async () => {
            (dto as any).expiration_date = 'invalid-date';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });

        it('should fail when expiration_date is missing', async () => {
            dto.expiration_date = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isDateString');
        });
    });

    describe('video_recording_url', () => {
        it('should accept valid URL', async () => {
            dto.video_recording_url = 'https://example.com/video.mp4';
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should accept undefined video_recording_url (optional)', async () => {
            dto.video_recording_url = undefined;
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail with invalid URL', async () => {
            dto.video_recording_url = 'not-a-url';
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUrl');
        });
    });

    describe('class transformation', () => {
        it('should transform plain object to class instance', () => {
            const plainObject = {
                application_id: '123e4567-e89b-12d3-a456-426614174001',
                config_id: '123e4567-e89b-12d3-a456-426614174002',
                status: InterviewStatus.PENDING,
                scheduled_date: '2024-01-16T12:00:00Z',
                expiration_date: '2024-01-17T12:00:00Z',
                video_recording_url: 'https://example.com/video.mp4',
            };

            const instance = plainToInstance(CreateInterviewDto, plainObject);
            expect(instance).toBeInstanceOf(CreateInterviewDto);
            expect(instance.application_id).toBe(plainObject.application_id);
            expect(instance.config_id).toBe(plainObject.config_id);
            expect(instance.status).toBe(plainObject.status);
            expect(instance.scheduled_date).toBe(plainObject.scheduled_date); // No se convierte automáticamente a Date
            expect(instance.expiration_date).toBe(plainObject.expiration_date); // No se convierte automáticamente a Date
            expect(instance.video_recording_url).toBe(plainObject.video_recording_url);
        });
    });
});
