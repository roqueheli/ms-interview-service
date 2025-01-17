import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsController } from './interview-configs.controller';
import { InterviewConfigsModule } from './interview-configs.module';
import { InterviewConfigsService } from './interview-configs.service';

describe('InterviewConfigsModule', () => {
    let module: TestingModule;

    // Mock del repositorio
    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [InterviewConfigsModule],
        })
            .overrideProvider(getRepositoryToken(InterviewConfig))
            .useValue(mockRepository)
            .compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    describe('Module Components', () => {
        it('should provide InterviewConfigsController', () => {
            const controller = module.get<InterviewConfigsController>(
                InterviewConfigsController,
            );
            expect(controller).toBeDefined();
        });

        it('should provide InterviewConfigsService', () => {
            const service = module.get<InterviewConfigsService>(
                InterviewConfigsService,
            );
            expect(service).toBeDefined();
        });

        it('should provide InterviewConfig repository', () => {
            const repository = module.get<Repository<InterviewConfig>>(
                getRepositoryToken(InterviewConfig),
            );
            expect(repository).toBeDefined();
        });
    });

    describe('Module Structure', () => {
        it('should have correct imports', () => {
            const imports = Reflect.getMetadata('imports', InterviewConfigsModule);
            expect(imports).toBeDefined();
            expect(imports[0].module).toBe(TypeOrmModule);
        });

        it('should have correct controllers', () => {
            const controllers = Reflect.getMetadata('controllers', InterviewConfigsModule);
            expect(controllers).toContain(InterviewConfigsController);
        });

        it('should have correct providers', () => {
            const providers = Reflect.getMetadata('providers', InterviewConfigsModule);
            expect(providers).toContain(InterviewConfigsService);
        });

        it('should have correct exports', () => {
            const exports = Reflect.getMetadata('exports', InterviewConfigsModule);
            expect(exports).toContain(InterviewConfigsService);
        });
    });

    describe('Module Integration', () => {
        let service: InterviewConfigsService;
        let controller: InterviewConfigsController;

        beforeEach(() => {
            service = module.get<InterviewConfigsService>(InterviewConfigsService);
            controller = module.get<InterviewConfigsController>(
                InterviewConfigsController,
            );
        });

        it('should have service injected in controller', () => {
            expect(controller['configsService']).toBeDefined();
            expect(controller['configsService']).toBeInstanceOf(InterviewConfigsService);
        });

        it('should have repository injected in service', () => {
            expect(service['configRepository']).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing repository dependency', async () => {
            const testModule = Test.createTestingModule({
                controllers: [InterviewConfigsController],
                providers: [InterviewConfigsService],
            });

            await expect(testModule.compile()).rejects.toThrow(
                /Nest can't resolve dependencies of the InterviewConfigsService/,
            );
        });

        it('should handle missing InterviewConfigRepository', async () => {
            const testModule = Test.createTestingModule({
                imports: [InterviewConfigsModule],
            })
                .overrideProvider(getRepositoryToken(InterviewConfig))
                .useValue(undefined);

            await expect(testModule.compile()).rejects.toThrow(
                /InterviewConfigRepository/,
            );
        });

        it('should throw error when required dependencies are not provided', async () => {
            const testModule = Test.createTestingModule({
                controllers: [InterviewConfigsController],
                providers: [InterviewConfigsService],
            });

            await expect(testModule.compile()).rejects.toThrow(
                expect.objectContaining({
                    message: expect.stringContaining('InterviewConfigRepository'),
                }),
            );
        });
    });
});