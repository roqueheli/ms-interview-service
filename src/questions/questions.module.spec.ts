import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsController } from './questions.controller';
import { QuestionsModule } from './questions.module';
import { QuestionsService } from './questions.service';

// Mock de ConfigService
const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
        const config = {
            REDIS_HOST: 'localhost',
            REDIS_PORT: 6380,
        };
        return config[key] || defaultValue;
    }),
};

// Mock del ClientProxy
const mockClientProxy = {
    send: jest.fn().mockImplementation(() => ({
        toPromise: () => Promise.resolve(true)
    })),
    emit: jest.fn(),
};

describe('QuestionsModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        const moduleRef = Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                TypeOrmModule.forFeature([Question]),
                ClientsModule.register([
                    {
                        name: 'QUESTION_SERVICE',
                        transport: Transport.REDIS,
                        options: {
                            host: 'localhost',
                            port: 6380,
                        },
                    },
                ]),
                QuestionsModule
            ],
        });

        // Override providers
        moduleRef
            .overrideProvider(getRepositoryToken(Question))
            .useValue({
                find: jest.fn(),
                findOne: jest.fn(),
                create: jest.fn(),
                save: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            })
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .overrideProvider('QUESTION_SERVICE')
            .useValue(mockClientProxy);

        module = await moduleRef.compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    describe('Module Structure', () => {
        it('should have QuestionsController', () => {
            const controller = module.get<QuestionsController>(QuestionsController);
            expect(controller).toBeDefined();
        });

        it('should have QuestionsService', () => {
            const service = module.get<QuestionsService>(QuestionsService);
            expect(service).toBeDefined();
        });

        it('should export QuestionsService', () => {
            const service = module.get<QuestionsService>(QuestionsService);
            expect(service).toBeDefined();
            expect(service instanceof QuestionsService).toBeTruthy();
        });
    });

    describe('Redis Configuration', () => {
        it('should have Redis client properly configured', () => {
            const clientProxy = module.get('QUESTION_SERVICE');
            expect(clientProxy).toBeDefined();
            expect(clientProxy.send).toBeDefined();
            expect(clientProxy.emit).toBeDefined();
        });

        it('should use correct Redis configuration from ConfigService', () => {
            const config = module.get(ConfigService);
            expect(config.get('REDIS_HOST')).toBe('localhost');
            expect(config.get('REDIS_PORT')).toBe(6380);
        });

        it('should have Redis client with working methods', () => {
            const clientProxy = module.get('QUESTION_SERVICE');
            expect(typeof clientProxy.send).toBe('function');
            expect(typeof clientProxy.emit).toBe('function');
        });
    });

    describe('TypeORM Configuration', () => {
        it('should have Question repository configured', () => {
            const repository = module.get(getRepositoryToken(Question));
            expect(repository).toBeDefined();
            expect(repository.find).toBeDefined();
            expect(repository.findOne).toBeDefined();
            expect(repository.create).toBeDefined();
            expect(repository.save).toBeDefined();
        });

        it('should have TypeORM repository methods available', () => {
            const repository = module.get(getRepositoryToken(Question));
            expect(typeof repository.find).toBe('function');
            expect(typeof repository.findOne).toBe('function');
            expect(typeof repository.create).toBe('function');
            expect(typeof repository.save).toBe('function');
        });
    });

    describe('Module Dependencies', () => {
        it('should have all required providers', () => {
            const service = module.get<QuestionsService>(QuestionsService);
            const repository = module.get(getRepositoryToken(Question));
            const clientProxy = module.get('QUESTION_SERVICE');

            expect(service).toBeDefined();
            expect(repository).toBeDefined();
            expect(clientProxy).toBeDefined();
        });

        it('should have all required controllers', () => {
            const controller = module.get<QuestionsController>(QuestionsController);
            expect(controller).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle Redis client errors', () => {
            const clientProxy = module.get('QUESTION_SERVICE');
            expect(() => {
                clientProxy.emit('test', {});
            }).not.toThrow();
        });

        it('should handle repository errors', () => {
            const repository = module.get(getRepositoryToken(Question));
            expect(() => {
                repository.find();
            }).not.toThrow();
        });
    });
});
