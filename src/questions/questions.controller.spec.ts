import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
    let controller: QuestionsController;
    let service: QuestionsService;
    let clientProxy: ClientProxy;

    const mockQuestion: Question = {
        question_id: '123e4567-e89b-12d3-a456-426614174000',
        job_role_id: '123e4567-e89b-12d3-a456-426614174001',
        seniority_id: '123e4567-e89b-12d3-a456-426614174002',
        question_text: 'What is dependency injection?',
        expected_answer: 'Dependency injection is a design pattern...',
        complexity_level: 3,
        created_at: new Date('2024-01-16T12:00:00Z'),
    };

    const mockQuestionsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByRoleAndSeniority: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockClientProxy = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionsController],
            providers: [
                {
                    provide: QuestionsService,
                    useValue: mockQuestionsService,
                },
                {
                    provide: 'QUESTION_SERVICE',
                    useValue: mockClientProxy,
                },
            ],
        }).compile();

        controller = module.get<QuestionsController>(QuestionsController);
        service = module.get<QuestionsService>(QuestionsService);
        clientProxy = module.get<ClientProxy>('QUESTION_SERVICE');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new question and emit an event', async () => {
            const createDto: CreateQuestionDto = {
                job_role_id: mockQuestion.job_role_id,
                seniority_id: mockQuestion.seniority_id,
                question_text: mockQuestion.question_text,
                expected_answer: mockQuestion.expected_answer,
                complexity_level: mockQuestion.complexity_level,
            };

            mockClientProxy.send.mockImplementation((pattern, data) => {
                if (pattern === 'verify_job_role') return of(true);
                if (pattern === 'verify_seniority_level') return of(true);
            });

            mockQuestionsService.create.mockResolvedValue(mockQuestion);

            const result = await controller.create(createDto);

            expect(clientProxy.send).toHaveBeenCalledWith('verify_job_role', createDto.job_role_id);
            expect(clientProxy.send).toHaveBeenCalledWith('verify_seniority_level', createDto.seniority_id);
            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(clientProxy.emit).toHaveBeenCalledWith('question_created', {
                question: mockQuestion,
                timestamp: expect.any(Date),
            });
            expect(result).toEqual(mockQuestion);
        });

        it('should throw an error if job role does not exist', async () => {
            const createDto: CreateQuestionDto = {
                job_role_id: mockQuestion.job_role_id,
                seniority_id: mockQuestion.seniority_id,
                question_text: mockQuestion.question_text,
                expected_answer: mockQuestion.expected_answer,
                complexity_level: mockQuestion.complexity_level,
            };

            mockClientProxy.send.mockImplementation((pattern, data) => {
                if (pattern === 'verify_job_role') return of(false);
                if (pattern === 'verify_seniority_level') return of(true);
            });

            await expect(controller.create(createDto)).rejects.toThrow('Job role not found');
        });

        it('should throw an error if seniority level does not exist', async () => {
            const createDto: CreateQuestionDto = {
                job_role_id: mockQuestion.job_role_id,
                seniority_id: mockQuestion.seniority_id,
                question_text: mockQuestion.question_text,
                expected_answer: mockQuestion.expected_answer,
                complexity_level: mockQuestion.complexity_level,
            };

            mockClientProxy.send.mockImplementation((pattern, data) => {
                if (pattern === 'verify_job_role') return of(true);
                if (pattern === 'verify_seniority_level') return of(false);
            });

            await expect(controller.create(createDto)).rejects.toThrow('Seniority level not found');
        });
    });

    describe('findAll', () => {
        it('should return an array of questions', async () => {
            const questions = [mockQuestion];
            mockQuestionsService.findAll.mockResolvedValue(questions);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(questions);
        });
    });

    describe('findOne', () => {
        it('should return a single question', async () => {
            mockQuestionsService.findOne.mockResolvedValue(mockQuestion);

            const result = await controller.findOne(mockQuestion.question_id);

            expect(service.findOne).toHaveBeenCalledWith(mockQuestion.question_id);
            expect(result).toEqual(mockQuestion);
        });

        it('should throw NotFoundException when question is not found', async () => {
            mockQuestionsService.findOne.mockRejectedValue(new NotFoundException());

            await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByRoleAndSeniority', () => {
        it('should return questions for specific role and seniority', async () => {
            const questions = [mockQuestion];
            mockClientProxy.send.mockImplementation((pattern, data) => {
                if (pattern === 'verify_job_role') return of(true);
                if (pattern === 'verify_seniority_level') return of(true);
            });

            mockQuestionsService.findByRoleAndSeniority.mockResolvedValue(questions);

            const result = await controller.findByRoleAndSeniority(
                mockQuestion.job_role_id,
                mockQuestion.seniority_id,
            );

            expect(clientProxy.send).toHaveBeenCalledWith('verify_job_role', mockQuestion.job_role_id);
            expect(clientProxy.send).toHaveBeenCalledWith('verify_seniority_level', mockQuestion.seniority_id);
            expect(service.findByRoleAndSeniority).toHaveBeenCalledWith(
                mockQuestion.job_role_id,
                mockQuestion.seniority_id,
            );
            expect(result).toEqual(questions);
        });

        it('should throw an error if job role does not exist', async () => {
            mockClientProxy.send.mockImplementation((pattern, data) => {
                if (pattern === 'verify_job_role') return of(false);
                if (pattern === 'verify_seniority_level') return of(true);
            });

            await expect(
                controller.findByRoleAndSeniority('non-existent-role', mockQuestion.seniority_id),
            ).rejects.toThrow('Job role not found');
        });

        it('should throw an error if seniority level does not exist', async () => {
            mockClientProxy.send.mockImplementation((pattern, data) => {
                if (pattern === 'verify_job_role') return of(true);
                if (pattern === 'verify_seniority_level') return of(false);
            });

            await expect(
                controller.findByRoleAndSeniority(mockQuestion.job_role_id, 'non-existent-seniority'),
            ).rejects.toThrow('Seniority level not found');
        });
    });

    describe('update', () => {
        it('should update a question and emit an event', async () => {
            const updateDto: UpdateQuestionDto = {
                question_text: 'Updated question text',
                complexity_level: 4,
            };

            const updatedQuestion = { ...mockQuestion, ...updateDto };
            mockQuestionsService.update.mockResolvedValue(updatedQuestion);

            const result = await controller.update(mockQuestion.question_id, updateDto);

            expect(service.update).toHaveBeenCalledWith(mockQuestion.question_id, updateDto);
            expect(clientProxy.emit).toHaveBeenCalledWith('question_updated', {
                question: updatedQuestion,
                timestamp: expect.any(Date),
            });
            expect(result).toEqual(updatedQuestion);
        });
    });

    describe('remove', () => {
        it('should remove a question and emit an event', async () => {
            mockQuestionsService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(mockQuestion.question_id);

            expect(service.remove).toHaveBeenCalledWith(mockQuestion.question_id);
            expect(clientProxy.emit).toHaveBeenCalledWith('question_deleted', {
                question_id: mockQuestion.question_id,
                timestamp: expect.any(Date),
            });
            expect(result).toEqual({ message: 'Question deleted successfully' });
        });
    });
});
