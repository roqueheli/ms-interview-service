import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
    let controller: QuestionsController;
    let service: QuestionsService;

    const mockQuestion: Question = {
        question_id: '123e4567-e89b-12d3-a456-426614174000',
        job_role_id: '123e4567-e89b-12d3-a456-426614174001',
        seniority_id: '123e4567-e89b-12d3-a456-426614174002',
        question_text: 'What is dependency injection?',
        expected_answer: 'Dependency injection is a design pattern...',
        complexity_level: 3,
        created_at: new Date('2024-01-16T12:00:00Z')
    };

    const mockQuestionsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByRoleAndSeniority: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionsController],
            providers: [
                {
                    provide: QuestionsService,
                    useValue: mockQuestionsService,
                },
            ],
        }).compile();

        controller = module.get<QuestionsController>(QuestionsController);
        service = module.get<QuestionsService>(QuestionsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new question', async () => {
            const createDto: CreateQuestionDto = {
                job_role_id: mockQuestion.job_role_id,
                seniority_id: mockQuestion.seniority_id,
                question_text: mockQuestion.question_text,
                expected_answer: mockQuestion.expected_answer,
                complexity_level: mockQuestion.complexity_level,
            };

            mockQuestionsService.create.mockResolvedValue(mockQuestion);

            const result = await controller.create(createDto);

            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(mockQuestion);
        });

        it('should handle errors when creating a question', async () => {
            const createDto: CreateQuestionDto = {
                job_role_id: mockQuestion.job_role_id,
                seniority_id: mockQuestion.seniority_id,
                question_text: mockQuestion.question_text,
                expected_answer: mockQuestion.expected_answer,
                complexity_level: mockQuestion.complexity_level,
            };

            mockQuestionsService.create.mockRejectedValue(new Error('Database error'));

            await expect(controller.create(createDto)).rejects.toThrow('Database error');
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

        it('should return empty array when no questions exist', async () => {
            mockQuestionsService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
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

            await expect(controller.findOne('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findByRoleAndSeniority', () => {
        it('should return questions for specific role and seniority', async () => {
            const questions = [mockQuestion];
            mockQuestionsService.findByRoleAndSeniority.mockResolvedValue(questions);

            const result = await controller.findByRoleAndSeniority(
                mockQuestion.job_role_id,
                mockQuestion.seniority_id
            );

            expect(service.findByRoleAndSeniority).toHaveBeenCalledWith(
                mockQuestion.job_role_id,
                mockQuestion.seniority_id
            );
            expect(result).toEqual(questions);
        });

        it('should return empty array when no questions found for role and seniority', async () => {
            mockQuestionsService.findByRoleAndSeniority.mockResolvedValue([]);

            const result = await controller.findByRoleAndSeniority(
                'non-existent-role',
                'non-existent-seniority'
            );

            expect(service.findByRoleAndSeniority).toHaveBeenCalledWith(
                'non-existent-role',
                'non-existent-seniority'
            );
            expect(result).toEqual([]);
        });
    });

    describe('update', () => {
        it('should update a question', async () => {
            const updateDto: UpdateQuestionDto = {
                question_text: 'Updated question text',
                complexity_level: 4,
            };

            const updatedQuestion = { ...mockQuestion, ...updateDto };
            mockQuestionsService.update.mockResolvedValue(updatedQuestion);

            const result = await controller.update(mockQuestion.question_id, updateDto);

            expect(service.update).toHaveBeenCalledWith(mockQuestion.question_id, updateDto);
            expect(result).toEqual(updatedQuestion);
        });

        it('should throw NotFoundException when updating non-existent question', async () => {
            const updateDto: UpdateQuestionDto = {
                question_text: 'Updated question text',
            };

            mockQuestionsService.update.mockRejectedValue(new NotFoundException());

            await expect(controller.update('non-existent-id', updateDto))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a question', async () => {
            mockQuestionsService.remove.mockResolvedValue(undefined);

            await controller.remove(mockQuestion.question_id);

            expect(service.remove).toHaveBeenCalledWith(mockQuestion.question_id);
        });

        it('should throw NotFoundException when removing non-existent question', async () => {
            mockQuestionsService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('Swagger Documentation', () => {
        it('should have ApiOperation decorator for each method', () => {
            const methods = ['create', 'findAll', 'findOne', 'findByRoleAndSeniority', 'update', 'remove'];

            methods.forEach(method => {
                const operation = Reflect.getMetadata(
                    'swagger/apiOperation',
                    QuestionsController.prototype[method]
                );
                expect(operation).toBeDefined();
                expect(operation.summary).toBeDefined();
            });
        });
    });
});
