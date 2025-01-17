import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewResultDto } from './dto/create-interview-result.dto';
import { UpdateInterviewResultDto } from './dto/update-interview-result.dto';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsService } from './interview-results.service';

describe('InterviewResultsService', () => {
    let service: InterviewResultsService;
    let repository: Repository<InterviewResult>;

    // Mock de un resultado de entrevista
    const mockInterviewResult = {
        result_id: '123e4567-e89b-12d3-a456-426614174000',
        interview_id: '123e4567-e89b-12d3-a456-426614174001',
        question_id: '123e4567-e89b-12d3-a456-426614174002',
        candidate_answer: 'Test answer',
        rating: 4,
        ai_feedback: 'Good answer',
        created_at: new Date(),
    };

    // Mock del repositorio
    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterviewResultsService,
                {
                    provide: getRepositoryToken(InterviewResult),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<InterviewResultsService>(InterviewResultsService);
        repository = module.get<Repository<InterviewResult>>(getRepositoryToken(InterviewResult));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new interview result', async () => {
            const createDto: CreateInterviewResultDto = {
                interview_id: mockInterviewResult.interview_id,
                question_id: mockInterviewResult.question_id,
                candidate_answer: mockInterviewResult.candidate_answer,
                rating: mockInterviewResult.rating,
                ai_feedback: mockInterviewResult.ai_feedback,
            };

            mockRepository.create.mockReturnValue(mockInterviewResult);
            mockRepository.save.mockResolvedValue(mockInterviewResult);

            const result = await service.create(createDto);

            expect(result).toEqual(mockInterviewResult);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockInterviewResult);
        });
    });

    describe('findAll', () => {
        it('should return an array of interview results', async () => {
            const results = [mockInterviewResult];
            mockRepository.find.mockResolvedValue(results);

            const foundResults = await service.findAll();

            expect(foundResults).toEqual(results);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single interview result', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockInterviewResult);

            const result = await service.findOne(mockInterviewResult.result_id);

            expect(result).toEqual(mockInterviewResult);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                result_id: mockInterviewResult.result_id,
            });
        });

        it('should throw NotFoundException when result not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne('nonexistent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findByInterview', () => {
        it('should return array of results for specific interview', async () => {
            const results = [mockInterviewResult];
            mockRepository.find.mockResolvedValue(results);

            const foundResults = await service.findByInterview(mockInterviewResult.interview_id);

            expect(foundResults).toEqual(results);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { interview_id: mockInterviewResult.interview_id },
            });
        });
    });

    describe('update', () => {
        it('should update an interview result', async () => {
            const updateDto: UpdateInterviewResultDto = {
                rating: 5,
                ai_feedback: 'Updated feedback',
            };

            const updatedResult = { ...mockInterviewResult, ...updateDto };
            mockRepository.findOneBy.mockResolvedValue(mockInterviewResult);
            mockRepository.save.mockResolvedValue(updatedResult);

            const result = await service.update(mockInterviewResult.result_id, updateDto);

            expect(result).toEqual(updatedResult);
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockInterviewResult,
                ...updateDto,
            });
        });

        it('should throw NotFoundException when updating non-existent result', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.update('nonexistent-id', { rating: 5 }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview result', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockInterviewResult);
            mockRepository.remove.mockResolvedValue(mockInterviewResult);

            await service.remove(mockInterviewResult.result_id);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockInterviewResult);
        });

        it('should throw NotFoundException when removing non-existent result', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove('nonexistent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateRating', () => {
        it('should update only the rating of an interview result', async () => {
            const newRating = 5;
            const updatedResult = { ...mockInterviewResult, rating: newRating };

            mockRepository.findOneBy.mockResolvedValue(mockInterviewResult);
            mockRepository.save.mockResolvedValue(updatedResult);

            const result = await service.updateRating(mockInterviewResult.result_id, newRating);

            expect(result.rating).toBe(newRating);
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockInterviewResult,
                rating: newRating,
            });
        });

        it('should throw NotFoundException when updating rating of non-existent result', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.updateRating('nonexistent-id', 5),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateAiFeedback', () => {
        it('should update only the AI feedback of an interview result', async () => {
            const newFeedback = 'New AI feedback';
            const updatedResult = { ...mockInterviewResult, ai_feedback: newFeedback };

            mockRepository.findOneBy.mockResolvedValue(mockInterviewResult);
            mockRepository.save.mockResolvedValue(updatedResult);

            const result = await service.updateAiFeedback(mockInterviewResult.result_id, newFeedback);

            expect(result.ai_feedback).toBe(newFeedback);
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockInterviewResult,
                ai_feedback: newFeedback,
            });
        });

        it('should throw NotFoundException when updating AI feedback of non-existent result', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.updateAiFeedback('nonexistent-id', 'New feedback'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
