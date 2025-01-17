import { Test, TestingModule } from '@nestjs/testing';
import { InterviewResultsController } from './interview-results.controller';
import { InterviewResultsService } from './interview-results.service';
import { CreateInterviewResultDto } from './dto/create-interview-result.dto';
import { UpdateInterviewResultDto } from './dto/update-interview-result.dto';
import { UpdateInterviewRatingDto } from './dto/update-interview-rating.dto';
import { UpdateInterviewFeedbackDto } from './dto/update-interview-feedback.dto';
import { InterviewResult } from './entities/interview-result.entity';
import { NotFoundException } from '@nestjs/common';

describe('InterviewResultsController', () => {
    let controller: InterviewResultsController;
    let service: InterviewResultsService;

    const mockInterviewResult: InterviewResult = {
        result_id: '123e4567-e89b-12d3-a456-426614174000',
        interview_id: '123e4567-e89b-12d3-a456-426614174001',
        question_id: '123e4567-e89b-12d3-a456-426614174002',
        candidate_answer: 'Test answer',
        rating: 4,
        ai_feedback: 'Test feedback',
        created_at: new Date()
    };

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByInterview: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        updateRating: jest.fn(),
        updateAiFeedback: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewResultsController],
            providers: [
                {
                    provide: InterviewResultsService,
                    useValue: mockService
                }
            ]
        }).compile();

        controller = module.get<InterviewResultsController>(InterviewResultsController);
        service = module.get<InterviewResultsService>(InterviewResultsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new interview result', async () => {
            const createDto: CreateInterviewResultDto = {
                interview_id: mockInterviewResult.interview_id,
                question_id: mockInterviewResult.question_id,
                candidate_answer: mockInterviewResult.candidate_answer,
                rating: mockInterviewResult.rating,
                ai_feedback: mockInterviewResult.ai_feedback
            };

            mockService.create.mockResolvedValue(mockInterviewResult);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockInterviewResult);
            expect(mockService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of interview results', async () => {
            const results = [mockInterviewResult];
            mockService.findAll.mockResolvedValue(results);

            const response = await controller.findAll();

            expect(response).toEqual(results);
            expect(mockService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single interview result', async () => {
            mockService.findOne.mockResolvedValue(mockInterviewResult);

            const result = await controller.findOne(mockInterviewResult.result_id);

            expect(result).toEqual(mockInterviewResult);
            expect(mockService.findOne).toHaveBeenCalledWith(mockInterviewResult.result_id);
        });

        it('should throw NotFoundException when result not found', async () => {
            mockService.findOne.mockRejectedValue(new NotFoundException());

            await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByInterview', () => {
        it('should return results for a specific interview', async () => {
            const results = [mockInterviewResult];
            mockService.findByInterview.mockResolvedValue(results);

            const response = await controller.findByInterview(mockInterviewResult.interview_id);

            expect(response).toEqual(results);
            expect(mockService.findByInterview).toHaveBeenCalledWith(mockInterviewResult.interview_id);
        });
    });

    describe('update', () => {
        it('should update an interview result', async () => {
            const updateDto: UpdateInterviewResultDto = {
                rating: 5,
                ai_feedback: 'Updated feedback'
            };

            const updatedResult = { ...mockInterviewResult, ...updateDto };
            mockService.update.mockResolvedValue(updatedResult);

            const result = await controller.update(mockInterviewResult.result_id, updateDto);

            expect(result).toEqual(updatedResult);
            expect(mockService.update).toHaveBeenCalledWith(mockInterviewResult.result_id, updateDto);
        });

        it('should throw NotFoundException when updating non-existent result', async () => {
            const updateDto: UpdateInterviewResultDto = { rating: 5 };
            mockService.update.mockRejectedValue(new NotFoundException());

            await expect(controller.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview result', async () => {
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove(mockInterviewResult.result_id);

            expect(mockService.remove).toHaveBeenCalledWith(mockInterviewResult.result_id);
        });

        it('should throw NotFoundException when removing non-existent result', async () => {
            mockService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateRating', () => {
        it('should update only the rating of an interview result', async () => {
            const ratingDto: UpdateInterviewRatingDto = { rating: 5 };
            const updatedResult = { ...mockInterviewResult, rating: ratingDto.rating };
            mockService.updateRating.mockResolvedValue(updatedResult);

            const result = await controller.updateRating(mockInterviewResult.result_id, ratingDto);

            expect(result).toEqual(updatedResult);
            expect(mockService.updateRating).toHaveBeenCalledWith(mockInterviewResult.result_id, ratingDto.rating);
        });

        it('should throw NotFoundException when updating rating of non-existent result', async () => {
            const ratingDto: UpdateInterviewRatingDto = { rating: 5 };
            mockService.updateRating.mockRejectedValue(new NotFoundException());

            await expect(controller.updateRating('non-existent-id', ratingDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateAiFeedback', () => {
        it('should update only the AI feedback of an interview result', async () => {
            const feedbackDto: UpdateInterviewFeedbackDto = { ai_feedback: 'New feedback' };
            const updatedResult = { ...mockInterviewResult, ai_feedback: feedbackDto.ai_feedback };
            mockService.updateAiFeedback.mockResolvedValue(updatedResult);

            const result = await controller.updateAiFeedback(mockInterviewResult.result_id, feedbackDto);

            expect(result).toEqual(updatedResult);
            expect(mockService.updateAiFeedback).toHaveBeenCalledWith(
                mockInterviewResult.result_id,
                feedbackDto.ai_feedback
            );
        });

        it('should throw NotFoundException when updating feedback of non-existent result', async () => {
            const feedbackDto: UpdateInterviewFeedbackDto = { ai_feedback: 'New feedback' };
            mockService.updateAiFeedback.mockRejectedValue(new NotFoundException());

            await expect(controller.updateAiFeedback('non-existent-id', feedbackDto)).rejects.toThrow(NotFoundException);
        });
    });
});
