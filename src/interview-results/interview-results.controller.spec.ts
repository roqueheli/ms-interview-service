import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { CreateInterviewResultDto } from './dto/create-interview-result.dto';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsController } from './interview-results.controller';
import { InterviewResultsService } from './interview-results.service';

// Definición de tipos para los patrones de mensajes y eventos
type MessagePattern = 'verify_interview' | 'verify_question' | 'verify_result';
type EventPattern =
    | 'interview_result_created'
    | 'interview_result_updated'
    | 'interview_result_deleted'
    | 'interview_result_rating_updated'
    | 'interview_result_feedback_updated';

// Interfaces para los eventos
interface BaseEventData {
    timestamp: Date;
}

interface ResultEventData extends BaseEventData {
    result: InterviewResult;
}

interface DeleteEventData extends BaseEventData {
    result_id: string;
}

interface RatingEventData extends BaseEventData {
    result_id: string;
    rating: number;
}

interface FeedbackEventData extends BaseEventData {
    result_id: string;
    feedback: string;
}

describe('InterviewResultsController', () => {
    let controller: InterviewResultsController;
    let service: InterviewResultsService;
    let redisClient: ClientProxy;

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

    const mockRedisClient = {
        send: jest.fn((pattern: MessagePattern, data: any): Observable<boolean> => of(true)),
        emit: jest.fn((event: EventPattern, data: BaseEventData): void => undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewResultsController],
            providers: [
                {
                    provide: InterviewResultsService,
                    useValue: mockService
                },
                {
                    provide: 'INTERVIEW_RESULT_SERVICE',
                    useValue: mockRedisClient
                }
            ]
        }).compile();

        controller = module.get<InterviewResultsController>(InterviewResultsController);
        service = module.get<InterviewResultsService>(InterviewResultsService);
        redisClient = module.get<ClientProxy>('INTERVIEW_RESULT_SERVICE');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new interview result and emit event', async () => {
            const createDto: CreateInterviewResultDto = {
                interview_id: mockInterviewResult.interview_id,
                question_id: mockInterviewResult.question_id,
                candidate_answer: mockInterviewResult.candidate_answer,
                rating: mockInterviewResult.rating,
                ai_feedback: mockInterviewResult.ai_feedback
            };

            mockService.create.mockResolvedValue(mockInterviewResult);
            mockRedisClient.send.mockImplementation((pattern: MessagePattern): Observable<boolean> => {
                if (pattern === 'verify_interview') return of(true);
                if (pattern === 'verify_question') return of(true);
                return of(false);
            });

            const result = await controller.create(createDto);

            expect(mockRedisClient.send).toHaveBeenCalledWith('verify_interview', createDto.interview_id);
            expect(mockRedisClient.send).toHaveBeenCalledWith('verify_question', createDto.question_id);
            expect(mockRedisClient.emit).toHaveBeenCalledWith(
                'interview_result_created',
                expect.objectContaining<ResultEventData>({
                    result: mockInterviewResult,
                    timestamp: expect.any(Date)
                })
            );
            expect(result).toEqual(mockInterviewResult);
        });

        it('should throw error if interview does not exist', async () => {
            const createDto: CreateInterviewResultDto = {
                interview_id: 'non-existent-id',
                question_id: mockInterviewResult.question_id,
                candidate_answer: 'Test',
                rating: 4,
                ai_feedback: 'Test'
            };

            mockRedisClient.send.mockImplementation((pattern: MessagePattern): Observable<boolean> => {
                if (pattern === 'verify_interview') return of(false);
                return of(true);
            });

            await expect(controller.create(createDto)).rejects.toThrow('Interview not found');
        });

        it('should throw error if question does not exist', async () => {
            const createDto: CreateInterviewResultDto = {
                interview_id: mockInterviewResult.interview_id,
                question_id: 'non-existent-id',
                candidate_answer: 'Test',
                rating: 4,
                ai_feedback: 'Test'
            };

            mockRedisClient.send.mockImplementation((pattern: MessagePattern): Observable<boolean> => {
                if (pattern === 'verify_interview') return of(true);
                if (pattern === 'verify_question') return of(false);
                return of(true);
            });

            await expect(controller.create(createDto)).rejects.toThrow('Question not found');
        });
    });

    // ... (resto de las pruebas con las mismas mejoras de tipos)

    describe('Event Handlers', () => {
        it('should handle result_created event', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const eventData: ResultEventData = {
                result: mockInterviewResult,
                timestamp: new Date()
            };

            await controller.handleResultCreated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('New interview result created:', eventData);
        });

        it('should handle result_updated event', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const eventData: ResultEventData = {
                result: mockInterviewResult,
                timestamp: new Date()
            };

            await controller.handleResultUpdated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview result updated:', eventData);
        });

        it('should handle result_deleted event', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const eventData: DeleteEventData = {
                result_id: mockInterviewResult.result_id,
                timestamp: new Date()
            };

            await controller.handleResultDeleted(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview result deleted:', eventData);
        });

        it('should handle rating_updated event', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const eventData: RatingEventData = {
                result_id: mockInterviewResult.result_id,
                rating: 5,
                timestamp: new Date()
            };

            await controller.handleRatingUpdated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview result rating updated:', eventData);
        });

        it('should handle feedback_updated event', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const eventData: FeedbackEventData = {
                result_id: mockInterviewResult.result_id,
                feedback: 'Updated feedback',
                timestamp: new Date()
            };

            await controller.handleFeedbackUpdated(eventData);

            expect(consoleSpy).toHaveBeenCalledWith('Interview result feedback updated:', eventData);
        });
    });

    describe('Message Patterns', () => {
        it('should verify existing result', async () => {
            mockService.findOne.mockResolvedValue(mockInterviewResult);

            const result = await controller.verifyResult(mockInterviewResult.result_id);

            expect(result).toEqual({ exists: true });
        });

        it('should return false for non-existing result', async () => {
            mockService.findOne.mockRejectedValue(new NotFoundException());

            const result = await controller.verifyResult('non-existent-id');

            expect(result).toEqual({ exists: false });
        });
    });
});