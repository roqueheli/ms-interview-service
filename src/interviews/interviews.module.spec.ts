import { Module, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InterviewConfigsModule } from '../interview-configs/interview-configs.module';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsModule } from './interviews.module';
import { InterviewsService } from './interviews.service';

describe('Interviews', () => {
    let module: TestingModule;
    let controller: InterviewsController;
    let service: InterviewsService;

    // Mock de una entrevista
    const mockInterview: Interview = {
        interview_id: '123e4567-e89b-12d3-a456-426614174000',
        application_id: '123e4567-e89b-12d3-a456-426614174001',
        config_id: '123e4567-e89b-12d3-a456-426614174002',
        status: InterviewStatus.PENDING,
        scheduled_date: new Date('2024-01-16T12:00:00Z'),
        expiration_date: new Date('2024-01-17T12:00:00Z'),
        video_recording_url: 'https://example.com/video.mp4',
        created_at: new Date('2024-01-16T12:00:00Z')
    };

    // Mock del servicio
    const mockInterviewsService = {
        create: jest.fn().mockResolvedValue(mockInterview),
        findAll: jest.fn().mockResolvedValue([mockInterview]),
        findOne: jest.fn().mockResolvedValue(mockInterview),
        findByApplication: jest.fn().mockResolvedValue(mockInterview), // Cambiado a un solo Interview
        update: jest.fn().mockResolvedValue(mockInterview),
        updateStatus: jest.fn().mockResolvedValue(mockInterview),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    // Mock del repositorio
    const mockRepository = {
        create: jest.fn().mockReturnValue(mockInterview),
        save: jest.fn().mockResolvedValue(mockInterview),
        find: jest.fn().mockResolvedValue([mockInterview]),
        findOne: jest.fn().mockResolvedValue(mockInterview),
        findOneBy: jest.fn().mockResolvedValue(mockInterview),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    @Module({
        providers: [{
            provide: 'INTERVIEW_CONFIGS_SERVICE',
            useValue: {}
        }],
        exports: ['INTERVIEW_CONFIGS_SERVICE']
    })
    class MockInterviewConfigsModule { }

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [InterviewsModule],
        })
            .overrideProvider(getRepositoryToken(Interview))
            .useValue(mockRepository)
            .overrideProvider(InterviewsService)
            .useValue(mockInterviewsService)
            .overrideModule(InterviewConfigsModule)
            .useModule(MockInterviewConfigsModule)
            .compile();

        controller = module.get<InterviewsController>(InterviewsController);
        service = module.get<InterviewsService>(InterviewsService);
    });

    describe('Module', () => {
        it('should be defined', () => {
            expect(module).toBeDefined();
        });

        it('should have InterviewsController', () => {
            expect(controller).toBeDefined();
        });

        it('should have InterviewsService', () => {
            expect(service).toBeDefined();
        });
    });

    describe('Controller', () => {
        describe('create', () => {
            it('should create a new interview', async () => {
                const createDto: CreateInterviewDto = {
                    application_id: mockInterview.application_id,
                    config_id: mockInterview.config_id,
                    scheduled_date: mockInterview.scheduled_date,
                    expiration_date: mockInterview.expiration_date,
                };

                const result = await controller.create(createDto);
                expect(result).toEqual(mockInterview);
                expect(service.create).toHaveBeenCalledWith(createDto);
            });
        });

        describe('findAll', () => {
            it('should return an array of interviews', async () => {
                const result = await controller.findAll();
                expect(result).toEqual([mockInterview]);
                expect(service.findAll).toHaveBeenCalled();
            });
        });

        describe('findOne', () => {
            it('should return a single interview', async () => {
                const result = await controller.findOne(mockInterview.interview_id);
                expect(result).toEqual(mockInterview);
                expect(service.findOne).toHaveBeenCalledWith(mockInterview.interview_id);
            });

            it('should throw NotFoundException when interview not found', async () => {
                jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
                await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
            });
        });

        describe('findByApplication', () => {
            it('should return an interview for an application', async () => {
                const result = await controller.findByApplication(mockInterview.application_id);
                expect(result).toEqual(mockInterview);
                expect(service.findByApplication).toHaveBeenCalledWith(mockInterview.application_id);
            });
        });

        describe('update', () => {
            it('should update an interview', async () => {
                const updateDto: UpdateInterviewDto = {
                    status: InterviewStatus.IN_PROGRESS,
                };

                const result = await controller.update(mockInterview.interview_id, updateDto);
                expect(result).toEqual(mockInterview);
                expect(service.update).toHaveBeenCalledWith(mockInterview.interview_id, updateDto);
            });
        });

        describe('updateStatus', () => {
            it('should update interview status', async () => {
                const newStatus = InterviewStatus.COMPLETED;
                const result = await controller.updateStatus(mockInterview.interview_id, newStatus);
                expect(result).toEqual(mockInterview);
                expect(service.updateStatus).toHaveBeenCalledWith(mockInterview.interview_id, newStatus);
            });
        });

        describe('remove', () => {
            it('should remove an interview', async () => {
                await controller.remove(mockInterview.interview_id);
                expect(service.remove).toHaveBeenCalledWith(mockInterview.interview_id);
            });
        });
    });

    describe('Entity', () => {
        it('should have all required properties', () => {
            const interview = new Interview();

            // Asignamos valores de prueba
            Object.assign(interview, {
                interview_id: '123e4567-e89b-12d3-a456-426614174000',
                application_id: '123e4567-e89b-12d3-a456-426614174001',
                config_id: '123e4567-e89b-12d3-a456-426614174002',
                status: InterviewStatus.PENDING,
                scheduled_date: new Date(),
                expiration_date: new Date(),
                video_recording_url: 'https://example.com/video.mp4',
                created_at: new Date()
            });

            // Verificamos que cada propiedad existe y tiene el tipo correcto
            expect(interview.interview_id).toBeDefined();
            expect(typeof interview.interview_id).toBe('string');

            expect(interview.application_id).toBeDefined();
            expect(typeof interview.application_id).toBe('string');

            expect(interview.config_id).toBeDefined();
            expect(typeof interview.config_id).toBe('string');

            expect(interview.status).toBeDefined();
            expect(Object.values(InterviewStatus)).toContain(interview.status);

            expect(interview.scheduled_date).toBeDefined();
            expect(interview.scheduled_date).toBeInstanceOf(Date);

            expect(interview.expiration_date).toBeDefined();
            expect(interview.expiration_date).toBeInstanceOf(Date);

            expect(interview.video_recording_url).toBeDefined();
            expect(typeof interview.video_recording_url).toBe('string');

            expect(interview.created_at).toBeDefined();
            expect(interview.created_at).toBeInstanceOf(Date);
        });

        it('should accept valid status values', () => {
            const interview = new Interview();

            // Probamos cada valor posible del enum
            Object.values(InterviewStatus).forEach(status => {
                interview.status = status;
                expect(interview.status).toBe(status);
            });
        });

        it('should handle dates correctly', () => {
            const interview = new Interview();
            const testDate = new Date();

            interview.scheduled_date = testDate;
            interview.expiration_date = testDate;
            interview.created_at = testDate;

            expect(interview.scheduled_date).toEqual(testDate);
            expect(interview.expiration_date).toEqual(testDate);
            expect(interview.created_at).toEqual(testDate);
        });

        it('should handle video URL', () => {
            const interview = new Interview();
            const testUrl = 'https://example.com/video.mp4';

            interview.video_recording_url = testUrl;
            expect(interview.video_recording_url).toBe(testUrl);
        });
    });
});
