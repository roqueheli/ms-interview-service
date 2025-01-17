import 'reflect-metadata';
import { InterviewConfig } from './interview-config.entity';

describe('InterviewConfig Entity', () => {
    let entity: InterviewConfig;

    beforeEach(() => {
        entity = new InterviewConfig();
        // Asignar valores válidos por defecto
        entity.config_id = '123e4567-e89b-12d3-a456-426614174000';
        entity.enterprise_id = '123e4567-e89b-12d3-a456-426614174001';
        entity.job_role_id = '123e4567-e89b-12d3-a456-426614174002';
        entity.seniority_id = '123e4567-e89b-12d3-a456-426614174003';
        entity.duration_minutes = 60;
        entity.num_questions = 10;
        entity.complexity_level = 3;
        entity.validity_hours = 24;
        entity.created_at = new Date();
    });

    describe('Entity Creation', () => {
        it('should create a valid entity', () => {
            expect(entity).toBeDefined();
            expect(entity instanceof InterviewConfig).toBeTruthy();
        });

        it('should have all required properties', () => {
            const properties = [
                'config_id',
                'enterprise_id',
                'job_role_id',
                'seniority_id',
                'duration_minutes',
                'num_questions',
                'complexity_level',
                'validity_hours',
                'created_at'
            ];

            properties.forEach(prop => {
                expect(entity).toHaveProperty(prop);
            });
        });
    });

    describe('Property Types', () => {
        it('should have UUID strings for ID fields', () => {
            const uuidFields = ['config_id', 'enterprise_id', 'job_role_id', 'seniority_id'];
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            uuidFields.forEach(field => {
                expect(typeof entity[field]).toBe('string');
                expect(entity[field]).toMatch(uuidPattern);
            });
        });

        it('should have numbers for numeric fields', () => {
            const numericFields = ['duration_minutes', 'num_questions', 'complexity_level', 'validity_hours'];

            numericFields.forEach(field => {
                expect(typeof entity[field]).toBe('number');
            });
        });

        it('should have Date for created_at', () => {
            expect(entity.created_at instanceof Date).toBeTruthy();
        });
    });

    describe('Property Values', () => {
        it('should accept valid duration_minutes', () => {
            const validValues = [1, 30, 60, 120];
            validValues.forEach(value => {
                entity.duration_minutes = value;
                expect(entity.duration_minutes).toBe(value);
            });
        });

        it('should accept valid num_questions', () => {
            const validValues = [1, 5, 10, 20];
            validValues.forEach(value => {
                entity.num_questions = value;
                expect(entity.num_questions).toBe(value);
            });
        });

        it('should accept valid complexity_level', () => {
            const validValues = [1, 2, 3, 4, 5];
            validValues.forEach(value => {
                entity.complexity_level = value;
                expect(entity.complexity_level).toBe(value);
            });
        });

        it('should accept valid validity_hours', () => {
            const validValues = [1, 12, 24, 48];
            validValues.forEach(value => {
                entity.validity_hours = value;
                expect(entity.validity_hours).toBe(value);
            });
        });
    });

    describe('Date Handling', () => {
        it('should handle created_at date assignment', () => {
            const now = new Date();
            entity.created_at = now;
            expect(entity.created_at).toEqual(now);
        });

        it('should store created_at as UTC', () => {
            const now = new Date();
            entity.created_at = now;
            expect(entity.created_at.toISOString()).toBe(now.toISOString());
        });
    });

    describe('Entity Methods', () => {
        it('should convert to JSON correctly', () => {
            const json = JSON.parse(JSON.stringify(entity));
            expect(json).toHaveProperty('config_id');
            expect(json).toHaveProperty('enterprise_id');
            expect(json).toHaveProperty('job_role_id');
            expect(json).toHaveProperty('seniority_id');
            expect(json).toHaveProperty('duration_minutes');
            expect(json).toHaveProperty('num_questions');
            expect(json).toHaveProperty('complexity_level');
            expect(json).toHaveProperty('validity_hours');
            expect(json).toHaveProperty('created_at');
        });
    });

    describe('Entity Structure', () => {
        it('should have all required columns', () => {
            const expectedColumns = [
                'config_id',
                'enterprise_id',
                'job_role_id',
                'seniority_id',
                'duration_minutes',
                'num_questions',
                'complexity_level',
                'validity_hours',
                'created_at'
            ];

            expectedColumns.forEach(column => {
                expect(entity).toHaveProperty(column);
            });
        });
    });
});