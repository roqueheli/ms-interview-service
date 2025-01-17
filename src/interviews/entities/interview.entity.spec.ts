import { plainToInstance } from 'class-transformer';
import 'reflect-metadata'; // Importante: añadir esta importación
import { Interview, InterviewStatus } from './interview.entity';

describe('Interview Entity', () => {
    let interview: Interview;

    beforeEach(() => {
        interview = new Interview();
        // Establecer valores por defecto para las propiedades requeridas
        interview.application_id = '123e4567-e89b-12d3-a456-426614174001';
        interview.config_id = '123e4567-e89b-12d3-a456-426614174002';
        interview.expiration_date = new Date('2024-01-17T12:00:00Z');
        interview.created_at = new Date('2024-01-16T12:00:00Z');
    });

    describe('Entity structure', () => {
        it('should have all required properties defined in class', () => {
            const interview = plainToInstance(Interview, {
                interview_id: '123e4567-e89b-12d3-a456-426614174000',
                application_id: '123e4567-e89b-12d3-a456-426614174001',
                config_id: '123e4567-e89b-12d3-a456-426614174002',
                status: InterviewStatus.PENDING,
                expiration_date: new Date('2024-01-17T12:00:00Z'),
                created_at: new Date('2024-01-16T12:00:00Z')
            });

            expect(interview).toBeInstanceOf(Interview);
            expect(interview.application_id).toBeDefined();
            expect(interview.config_id).toBeDefined();
            expect(interview.expiration_date).toBeDefined();
        });

        it('should allow optional properties to be undefined', () => {
            const interview = new Interview();
            expect(interview.scheduled_date).toBeUndefined();
            expect(interview.video_recording_url).toBeUndefined();
        });
    });

    describe('InterviewStatus enum', () => {
        it('should contain all required status values', () => {
            const expectedStatuses = [
                'pending',
                'scheduled',
                'in_progress',
                'completed',
                'cancelled'
            ];

            expectedStatuses.forEach(status => {
                expect(Object.values(InterviewStatus)).toContain(status);
            });
        });

        // Eliminamos la prueba del valor por defecto ya que se establece en la base de datos
    });

    describe('Optional properties', () => {
        it('should allow undefined for scheduled_date', () => {
            expect(interview.scheduled_date).toBeUndefined();
        });

        it('should allow undefined for video_recording_url', () => {
            expect(interview.video_recording_url).toBeUndefined();
        });
    });

    describe('Date handling', () => {
        it('should handle scheduled_date as Date object', () => {
            const date = new Date('2024-01-16T12:00:00Z');
            interview.scheduled_date = date;
            expect(interview.scheduled_date).toBeInstanceOf(Date);
            expect(interview.scheduled_date.toISOString()).toBe(date.toISOString());
        });

        it('should handle expiration_date as Date object', () => {
            const date = new Date('2024-01-17T12:00:00Z');
            interview.expiration_date = date;
            expect(interview.expiration_date).toBeInstanceOf(Date);
            expect(interview.expiration_date.toISOString()).toBe(date.toISOString());
        });
    });

    describe('Status transitions', () => {
        it('should allow setting valid status values', () => {
            Object.values(InterviewStatus).forEach(status => {
                interview.status = status;
                expect(interview.status).toBe(status);
            });
        });

        // Eliminamos la prueba de type safety ya que no es aplicable en tiempo de ejecución
    });

    describe('URL handling', () => {
        it('should accept valid URL for video_recording_url', () => {
            const url = 'https://example.com/video.mp4';
            interview.video_recording_url = url;
            expect(interview.video_recording_url).toBe(url);
        });

        it('should handle undefined video_recording_url', () => {
            expect(interview.video_recording_url).toBeUndefined();
        });
    });

    describe('UUID handling', () => {
        it('should handle application_id as string', () => {
            const validUUID = '123e4567-e89b-12d3-a456-426614174001';
            interview.application_id = validUUID;
            expect(interview.application_id).toBe(validUUID);
        });

        it('should handle config_id as string', () => {
            const validUUID = '123e4567-e89b-12d3-a456-426614174002';
            interview.config_id = validUUID;
            expect(interview.config_id).toBe(validUUID);
        });
    });

    describe('Class transformation', () => {
        it('should transform plain object to Interview instance', () => {
            const plainObject = {
                application_id: '123e4567-e89b-12d3-a456-426614174001',
                config_id: '123e4567-e89b-12d3-a456-426614174002',
                status: InterviewStatus.PENDING,
                expiration_date: '2024-01-17T12:00:00Z',
                created_at: '2024-01-16T12:00:00Z'
            };

            const instance = plainToInstance(Interview, plainObject);
            expect(instance).toBeInstanceOf(Interview);
            expect(instance.application_id).toBe(plainObject.application_id);
            expect(instance.config_id).toBe(plainObject.config_id);
            expect(instance.status).toBe(plainObject.status);
        });
    });
});
