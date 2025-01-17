import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewConfigsService } from '../interview-configs/interview-configs.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { InterviewsService } from './interviews.service';

describe('InterviewsService', () => {
    let service: InterviewsService;
    let repository: Repository<Interview>;
    let configsService: InterviewConfigsService;

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

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        remove: jest.fn(),
    };

    const mockConfigsService = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterviewsService,
                {
                    provide: getRepositoryToken(Interview),
                    useValue: mockRepository,
                },
                {
                    provide: InterviewConfigsService,
                    useValue: mockConfigsService,
                },
            ],
        }).compile();

        service = module.get<InterviewsService>(InterviewsService);
        repository = module.get<Repository<Interview>>(getRepositoryToken(Interview));
        configsService = module.get<InterviewConfigsService>(InterviewConfigsService);
    });

    describe('create', () => {
        it('should create a new interview', async () => {
            const createDto: CreateInterviewDto = {
                application_id: mockInterview.application_id,
                config_id: mockInterview.config_id,
                scheduled_date: mockInterview.scheduled_date,
                expiration_date: mockInterview.expiration_date,
            };

            mockConfigsService.findOne.mockResolvedValue({ config_id: createDto.config_id });
            mockRepository.create.mockReturnValue(mockInterview);
            mockRepository.save.mockResolvedValue(mockInterview);

            const result = await service.create(createDto);

            expect(mockConfigsService.findOne).toHaveBeenCalledWith(createDto.config_id);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockInterview);
            expect(result).toEqual(mockInterview);
        });

        it('should throw error if config does not exist', async () => {
            const createDto: CreateInterviewDto = {
                application_id: mockInterview.application_id,
                config_id: 'non-existent-config',
                scheduled_date: mockInterview.scheduled_date,
                expiration_date: mockInterview.expiration_date,
            };

            mockConfigsService.findOne.mockRejectedValue(new NotFoundException());

            await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return an array of interviews', async () => {
            mockRepository.find.mockResolvedValue([mockInterview]);

            const result = await service.findAll();

            expect(mockRepository.find).toHaveBeenCalled();
            expect(result).toEqual([mockInterview]);
        });
    });

    describe('findOne', () => {
        it('should return a single interview', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockInterview);

            const result = await service.findOne(mockInterview.interview_id);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                interview_id: mockInterview.interview_id
            });
            expect(result).toEqual(mockInterview);
        });

        it('should throw NotFoundException if interview not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update an interview', async () => {
            const updateDto: UpdateInterviewDto = {
                status: InterviewStatus.IN_PROGRESS,
            };

            const updatedInterview = { ...mockInterview, ...updateDto };
            mockRepository.findOneBy.mockResolvedValue(mockInterview);
            mockRepository.save.mockResolvedValue(updatedInterview);

            const result = await service.update(mockInterview.interview_id, updateDto);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                interview_id: mockInterview.interview_id
            });
            expect(mockRepository.save).toHaveBeenCalledWith(updatedInterview);
            expect(result).toEqual(updatedInterview);
        });

        it('should throw NotFoundException if interview to update not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update('non-existent-id', {}))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockInterview);
            mockRepository.remove.mockResolvedValue(mockInterview);

            await service.remove(mockInterview.interview_id);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                interview_id: mockInterview.interview_id
            });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockInterview);
        });

        it('should throw NotFoundException if interview to remove not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findByApplication', () => {
        it('should return an interview for an application', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockInterview);

            const result = await service.findByApplication(mockInterview.application_id);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                application_id: mockInterview.application_id
            });
            expect(result).toEqual(mockInterview);
        });

        it('should throw NotFoundException if interview for application not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findByApplication('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update interview status', async () => {
            const newStatus = InterviewStatus.COMPLETED;
            const updatedInterview = { ...mockInterview, status: newStatus };

            mockRepository.findOneBy.mockResolvedValue(mockInterview);
            mockRepository.save.mockResolvedValue(updatedInterview);

            const result = await service.updateStatus(mockInterview.interview_id, newStatus);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                interview_id: mockInterview.interview_id
            });
            expect(mockRepository.save).toHaveBeenCalledWith(updatedInterview);
            expect(result).toEqual(updatedInterview);
        });

        it('should throw NotFoundException if interview to update status not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.updateStatus('non-existent-id', InterviewStatus.COMPLETED))
                .rejects.toThrow(NotFoundException);
        });
    });
});
