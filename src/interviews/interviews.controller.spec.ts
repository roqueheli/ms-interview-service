import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

describe('InterviewsController', () => {
    let controller: InterviewsController;
    let service: InterviewsService;
    let redisClient: ClientProxy;

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

    const mockInterviewsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByApplication: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        remove: jest.fn(),
    };

    const mockRedisClient = {
        send: jest.fn(() => of(true)),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewsController],
            providers: [
                {
                    provide: InterviewsService,
                    useValue: mockInterviewsService,
                },
                {
                    provide: 'INTERVIEW_SERVICE',
                    useValue: mockRedisClient,
                },
            ],
        }).compile();

        controller = module.get<InterviewsController>(InterviewsController);
        service = module.get<InterviewsService>(InterviewsService);
        redisClient = module.get<ClientProxy>('INTERVIEW_SERVICE');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new interview and emit event', async () => {
            const createDto: CreateInterviewDto = {
                application_id: mockInterview.application_id,
                config_id: mockInterview.config_id,
                scheduled_date: mockInterview.scheduled_date,
                expiration_date: mockInterview.expiration_date,
            };

            mockInterviewsService.create.mockResolvedValue(mockInterview);
            mockRedisClient.send.mockReturnValue(of(true));

            const result = await controller.create(createDto);

            expect(mockRedisClient.send).toHaveBeenCalledWith(
                'verify_application',
                createDto.application_id
            );
            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(mockRedisClient.emit).toHaveBeenCalledWith(
                'interview_created',
                expect.objectContaining({
                    interview: mockInterview,
                    timestamp: expect.any(Date)
                })
            );
            expect(result).toEqual(mockInterview);
        });

        it('should throw error if application does not exist', async () => {
            const createDto: CreateInterviewDto = {
                application_id: 'non-existent-id',
                config_id: mockInterview.config_id,
                scheduled_date: mockInterview.scheduled_date,
                expiration_date: mockInterview.expiration_date,
            };

            mockRedisClient.send.mockReturnValue(of(false));

            await expect(controller.create(createDto)).rejects.toThrow('Application not found');
        });
    });

    describe('findByApplication', () => {
        it('should return interviews for existing application', async () => {
            mockRedisClient.send.mockReturnValue(of(true));
            mockInterviewsService.findByApplication.mockResolvedValue([mockInterview]);

            const result = await controller.findByApplication(mockInterview.application_id);

            expect(mockRedisClient.send).toHaveBeenCalledWith(
                'verify_application',
                mockInterview.application_id
            );
            expect(service.findByApplication).toHaveBeenCalledWith(mockInterview.application_id);
            expect(result).toEqual([mockInterview]);
        });

        it('should throw error if application does not exist', async () => {
            mockRedisClient.send.mockReturnValue(of(false));

            await expect(controller.findByApplication('non-existent-id'))
                .rejects.toThrow('Application not found');
        });
    });

    describe('update', () => {
        it('should update interview and emit event', async () => {
            const updateDto: UpdateInterviewDto = {
                status: InterviewStatus.IN_PROGRESS,
            };
            const updatedInterview = { ...mockInterview, ...updateDto };

            mockInterviewsService.update.mockResolvedValue(updatedInterview);

            const result = await controller.update(mockInterview.interview_id, updateDto);

            expect(service.update).toHaveBeenCalledWith(mockInterview.interview_id, updateDto);
            expect(mockRedisClient.emit).toHaveBeenCalledWith(
                'interview_updated',
                expect.objectContaining({
                    interview: updatedInterview,
                    timestamp: expect.any(Date)
                })
            );
            expect(result).toEqual(updatedInterview);
        });
    });

    describe('updateStatus', () => {
        it('should update status and emit event', async () => {
            const newStatus = InterviewStatus.COMPLETED;
            const updatedInterview = { ...mockInterview, status: newStatus };

            mockInterviewsService.updateStatus.mockResolvedValue(updatedInterview);

            const result = await controller.updateStatus(mockInterview.interview_id, newStatus);

            expect(service.updateStatus).toHaveBeenCalledWith(mockInterview.interview_id, newStatus);
            expect(mockRedisClient.emit).toHaveBeenCalledWith(
                'interview_status_updated',
                expect.objectContaining({
                    interview_id: mockInterview.interview_id,
                    status: newStatus,
                    timestamp: expect.any(Date)
                })
            );
            expect(result).toEqual(updatedInterview);
        });
    });

    describe('remove', () => {
        it('should remove interview and emit event', async () => {
            mockInterviewsService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(mockInterview.interview_id);

            expect(service.remove).toHaveBeenCalledWith(mockInterview.interview_id);
            expect(mockRedisClient.emit).toHaveBeenCalledWith(
                'interview_deleted',
                expect.objectContaining({
                    interview_id: mockInterview.interview_id,
                    timestamp: expect.any(Date)
                })
            );
            expect(result).toEqual({ message: 'Interview deleted successfully' });
        });
    });

    describe('Event Handlers', () => {
        it('should handle interview_created event', async () => {
            const eventData = {
                interview: mockInterview,
                timestamp: new Date(),
            };

            // Spy on console.log
            const consoleSpy = jest.spyOn(console, 'log');

            await controller.handleInterviewCreated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('New interview created:', eventData);
        });

        it('should handle interview_updated event', async () => {
            const eventData = {
                interview: mockInterview,
                timestamp: new Date(),
            };

            const consoleSpy = jest.spyOn(console, 'log');

            await controller.handleInterviewUpdated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview updated:', eventData);
        });

        it('should handle interview_status_updated event', async () => {
            const eventData = {
                interview_id: mockInterview.interview_id,
                status: InterviewStatus.COMPLETED,
                timestamp: new Date(),
            };

            const consoleSpy = jest.spyOn(console, 'log');

            await controller.handleInterviewStatusUpdated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview status updated:', eventData);
        });

        it('should handle interview_deleted event', async () => {
            const eventData = {
                interview_id: mockInterview.interview_id,
                timestamp: new Date(),
            };

            const consoleSpy = jest.spyOn(console, 'log');

            await controller.handleInterviewDeleted(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview deleted:', eventData);
        });
    });

    describe('Message Patterns', () => {
        it('should verify existing interview', async () => {
            mockInterviewsService.findOne.mockResolvedValue(mockInterview);

            const result = await controller.verifyInterview(mockInterview.interview_id);

            expect(service.findOne).toHaveBeenCalledWith(mockInterview.interview_id);
            expect(result).toEqual({ exists: true });
        });

        it('should return false for non-existing interview', async () => {
            mockInterviewsService.findOne.mockRejectedValue(new NotFoundException());

            const result = await controller.verifyInterview('non-existent-id');

            expect(result).toEqual({ exists: false });
        });
    });
});
