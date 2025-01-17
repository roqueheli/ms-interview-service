import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsModule } from './questions.module';
import { QuestionsService } from './questions.service';

describe('QuestionsModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [QuestionsModule]
        })
            .overrideProvider(getRepositoryToken(Question))
            .useValue({
                find: jest.fn(),
                findOne: jest.fn(),
                create: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            })
            .compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should have QuestionsController', () => {
        const controller = module.get<QuestionsController>(QuestionsController);
        expect(controller).toBeDefined();
    });

    it('should have QuestionsService', () => {
        const service = module.get<QuestionsService>(QuestionsService);
        expect(service).toBeDefined();
    });

    it('should export QuestionsService', () => {
        const exports = Reflect.getMetadata('exports', QuestionsModule);
        expect(exports).toContain(QuestionsService);
    });
});
