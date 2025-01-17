import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsController } from './interview-results.controller';
import { InterviewResultsModule } from './interview-results.module';
import { InterviewResultsService } from './interview-results.service';

describe('InterviewResultsModule', () => {
    let module: TestingModule;
    let service: InterviewResultsService;
    let controller: InterviewResultsController;
    let repository: Repository<InterviewResult>;

    // Mock del repositorio
    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [InterviewResultsModule],
        })
            .overrideProvider(getRepositoryToken(InterviewResult))
            .useValue(mockRepository)
            .compile();

        service = module.get<InterviewResultsService>(InterviewResultsService);
        controller = module.get<InterviewResultsController>(InterviewResultsController);
        repository = module.get<Repository<InterviewResult>>(getRepositoryToken(InterviewResult));
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    describe('module structure', () => {
        it('should have InterviewResultsController', () => {
            expect(controller).toBeDefined();
        });

        it('should have InterviewResultsService', () => {
            expect(service).toBeDefined();
        });

        it('should have repository injected', () => {
            expect(repository).toBeDefined();
            expect(repository).toEqual(mockRepository);
        });
    });

    describe('dependency injection', () => {
        it('should properly inject repository into service', () => {
            // Verificamos que el repositorio se inyecta correctamente a través del constructor
            const injectedRepository = module.get<Repository<InterviewResult>>(getRepositoryToken(InterviewResult));
            expect(injectedRepository).toBeDefined();
            expect(injectedRepository).toEqual(mockRepository);
        });
    });

    describe('error handling', () => {
        it('should throw error when repository is not provided', async () => {
            const testModule = Test.createTestingModule({
                controllers: [InterviewResultsController],
                providers: [
                    InterviewResultsService,
                    // No proporcionamos el repositorio
                ],
            });

            await expect(testModule.compile()).rejects.toThrow();
        });
    });

    describe('service availability', () => {
        it('should make service available for export', () => {
            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(InterviewResultsService);
        });

        it('should have working service methods', () => {
            expect(service.create).toBeDefined();
            expect(service.findAll).toBeDefined();
            expect(service.findOne).toBeDefined();
            expect(service.update).toBeDefined();
            expect(service.remove).toBeDefined();
        });
    });

    describe('controller availability', () => {
        it('should have working controller methods', () => {
            expect(controller.create).toBeDefined();
            expect(controller.findAll).toBeDefined();
            expect(controller.findOne).toBeDefined();
            expect(controller.update).toBeDefined();
            expect(controller.remove).toBeDefined();
        });
    });
});
