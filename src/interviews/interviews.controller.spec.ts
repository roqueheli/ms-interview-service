import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

describe('InterviewsController', () => {
    let controller: InterviewsController;
    let service: InterviewsService;

    // Mock de una entrevista para usar en las pruebas
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
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByApplication: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewsController],
            providers: [
                {
                    provide: InterviewsService,
                    useValue: mockInterviewsService,
                },
            ],
        }).compile();

        controller = module.get<InterviewsController>(InterviewsController);
        service = module.get<InterviewsService>(InterviewsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new interview', async () => {
            const createDto: CreateInterviewDto = {
                application_id: mockInterview.application_id,
                config_id: mockInterview.config_id,
                scheduled_date: mockInterview.scheduled_date,
                expiration_date: mockInterview.expiration_date,
            };

            mockInterviewsService.create.mockResolvedValue(mockInterview);

            const result = await controller.create(createDto);

            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(mockInterview);
        });
    });

    describe('findAll', () => {
        it('should return an array of interviews', async () => {
            const interviews = [mockInterview];
            mockInterviewsService.findAll.mockResolvedValue(interviews);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(interviews);
        });
    });

    describe('findOne', () => {
        it('should return a single interview', async () => {
            mockInterviewsService.findOne.mockResolvedValue(mockInterview);

            const result = await controller.findOne(mockInterview.interview_id);

            expect(service.findOne).toHaveBeenCalledWith(mockInterview.interview_id);
            expect(result).toEqual(mockInterview);
        });

        it('should throw NotFoundException when interview is not found', async () => {
            mockInterviewsService.findOne.mockRejectedValue(new NotFoundException());

            await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByApplication', () => {
        it('should return interviews for a specific application', async () => {
            const interviews = [mockInterview];
            mockInterviewsService.findByApplication.mockResolvedValue(interviews);

            const result = await controller.findByApplication(mockInterview.application_id);

            expect(service.findByApplication).toHaveBeenCalledWith(mockInterview.application_id);
            expect(result).toEqual(interviews);
        });

        it('should return empty array when no interviews found for application', async () => {
            mockInterviewsService.findByApplication.mockResolvedValue([]);

            const result = await controller.findByApplication('non-existent-id');

            expect(result).toEqual([]);
        });
    });

    describe('update', () => {
        it('should update an interview', async () => {
            const updateDto: UpdateInterviewDto = {
                status: InterviewStatus.IN_PROGRESS,
                scheduled_date: new Date('2024-01-18T12:00:00Z'),
            };

            mockInterviewsService.update.mockResolvedValue({ ...mockInterview, ...updateDto });

            const result = await controller.update(mockInterview.interview_id, updateDto);

            expect(service.update).toHaveBeenCalledWith(mockInterview.interview_id, updateDto);
            expect(result).toEqual({ ...mockInterview, ...updateDto });
        });

        it('should throw NotFoundException when updating non-existent interview', async () => {
            const updateDto: UpdateInterviewDto = {
                status: InterviewStatus.IN_PROGRESS,
            };

            mockInterviewsService.update.mockRejectedValue(new NotFoundException());

            await expect(controller.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update interview status', async () => {
            const newStatus = InterviewStatus.COMPLETED;
            const updatedInterview = { ...mockInterview, status: newStatus };

            mockInterviewsService.updateStatus.mockResolvedValue(updatedInterview);

            const result = await controller.updateStatus(mockInterview.interview_id, newStatus);

            expect(service.updateStatus).toHaveBeenCalledWith(mockInterview.interview_id, newStatus);
            expect(result).toEqual(updatedInterview);
        });

        it('should throw NotFoundException when updating status of non-existent interview', async () => {
            mockInterviewsService.updateStatus.mockRejectedValue(new NotFoundException());

            await expect(controller.updateStatus('non-existent-id', InterviewStatus.COMPLETED))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview', async () => {
            mockInterviewsService.remove.mockResolvedValue(undefined);

            await controller.remove(mockInterview.interview_id);

            expect(service.remove).toHaveBeenCalledWith(mockInterview.interview_id);
        });

        it('should throw NotFoundException when removing non-existent interview', async () => {
            mockInterviewsService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });
});
