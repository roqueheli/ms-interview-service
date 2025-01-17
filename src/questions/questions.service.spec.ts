import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
    let service: QuestionsService;
    let repository: Repository<Question>;

    const mockQuestion: Question = {
        question_id: '123e4567-e89b-12d3-a456-426614174000',
        job_role_id: '123e4567-e89b-12d3-a456-426614174001',
        seniority_id: '123e4567-e89b-12d3-a456-426614174002',
        question_text: 'What is dependency injection?',
        expected_answer: 'Dependency injection is a design pattern...',
        complexity_level: 3,
        created_at: new Date('2024-01-16T12:00:00Z')
    };

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
                QuestionsService,
                {
                    provide: getRepositoryToken(Question),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<QuestionsService>(QuestionsService);
        repository = module.get<Repository<Question>>(getRepositoryToken(Question));
    });

    afterEach(() => {
        jest.clearAllMocks();
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

            mockRepository.create.mockReturnValue(mockQuestion);
            mockRepository.save.mockResolvedValue(mockQuestion);

            const result = await service.create(createDto);

            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(mockQuestion);
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

            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createDto)).rejects.toThrow('Database error');
        });
    });

    describe('findAll', () => {
        it('should return an array of questions', async () => {
            const questions = [mockQuestion];
            mockRepository.find.mockResolvedValue(questions);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(questions);
        });

        it('should return empty array when no questions exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a question by id', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockQuestion);

            const result = await service.findOne(mockQuestion.question_id);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                question_id: mockQuestion.question_id,
            });
            expect(result).toEqual(mockQuestion);
        });

        it('should throw NotFoundException when question is not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a question', async () => {
            const updateDto: UpdateQuestionDto = {
                question_text: 'Updated question text',
                complexity_level: 4,
            };

            const updatedQuestion = { ...mockQuestion, ...updateDto };
            mockRepository.findOneBy.mockResolvedValue(mockQuestion);
            mockRepository.save.mockResolvedValue(updatedQuestion);

            const result = await service.update(mockQuestion.question_id, updateDto);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                question_id: mockQuestion.question_id,
            });
            expect(repository.save).toHaveBeenCalledWith(updatedQuestion);
            expect(result).toEqual(updatedQuestion);
        });

        it('should throw NotFoundException when updating non-existent question', async () => {
            const updateDto: UpdateQuestionDto = {
                question_text: 'Updated question text',
            };

            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update('non-existent-id', updateDto))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a question', async () => {
            mockRepository.findOneBy.mockResolvedValue(mockQuestion);
            mockRepository.remove.mockResolvedValue(mockQuestion);

            await service.remove(mockQuestion.question_id);

            expect(repository.findOneBy).toHaveBeenCalledWith({
                question_id: mockQuestion.question_id,
            });
            expect(repository.remove).toHaveBeenCalledWith(mockQuestion);
        });

        it('should throw NotFoundException when removing non-existent question', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove('non-existent-id'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findByRoleAndSeniority', () => {
        it('should return questions for specific role and seniority', async () => {
            const questions = [mockQuestion];
            mockRepository.find.mockResolvedValue(questions);

            const result = await service.findByRoleAndSeniority(
                mockQuestion.job_role_id,
                mockQuestion.seniority_id
            );

            expect(repository.find).toHaveBeenCalledWith({
                where: {
                    job_role_id: mockQuestion.job_role_id,
                    seniority_id: mockQuestion.seniority_id,
                },
            });
            expect(result).toEqual(questions);
        });

        it('should return empty array when no questions found for role and seniority', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findByRoleAndSeniority(
                'non-existent-role',
                'non-existent-seniority'
            );

            expect(repository.find).toHaveBeenCalledWith({
                where: {
                    job_role_id: 'non-existent-role',
                    seniority_id: 'non-existent-seniority',
                },
            });
            expect(result).toEqual([]);
        });
    });
});
