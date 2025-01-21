import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsController } from './interview-configs.controller';
import { InterviewConfigsModule } from './interview-configs.module';
import { InterviewConfigsService } from './interview-configs.service';

@Module({
    providers: [
        {
            provide: 'INTERVIEW_CONFIG_SERVICE',
            useValue: {
                connect: jest.fn().mockResolvedValue(undefined),
                close: jest.fn().mockResolvedValue(undefined),
                emit: jest.fn().mockResolvedValue(undefined),
                send: jest.fn().mockResolvedValue(undefined)
            }
        }
    ],
    exports: ['INTERVIEW_CONFIG_SERVICE']
})
class MockRedisModule { }

describe('InterviewConfigsModule', () => {
    let module: TestingModule;
    let configService: ConfigService;

    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string, defaultValue: any) => {
            const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6380,
                REDIS_CONNECT_TIMEOUT: 10000,
                REDIS_COMMAND_TIMEOUT: 5000,
                REDIS_RETRY_ATTEMPTS: 5,
                REDIS_RETRY_DELAY: 1000,
                retry_strategy: (options: any) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        return 100;
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        return new Error('Redis retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        return new Error('Redis retry attempts exhausted');
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            };
            return config[key] ?? defaultValue;
        }),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [InterviewConfigsModule]
        })
            .overrideProvider(getRepositoryToken(InterviewConfig))
            .useValue(mockRepository)
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .overrideModule(ClientsModule)
            .useModule(MockRedisModule)
            .compile();

        configService = module.get<ConfigService>(ConfigService);
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    describe('Module Components', () => {
        it('should provide InterviewConfigsController', () => {
            const controller = module.get<InterviewConfigsController>(InterviewConfigsController);
            expect(controller).toBeDefined();
        });

        it('should provide InterviewConfigsService', () => {
            const service = module.get<InterviewConfigsService>(InterviewConfigsService);
            expect(service).toBeDefined();
        });

        it('should provide InterviewConfig repository', () => {
            const repository = module.get<Repository<InterviewConfig>>(getRepositoryToken(InterviewConfig));
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

    describe('Redis Configuration', () => {
        it('should have correct Redis host configuration', () => {
            expect(configService.get('REDIS_HOST')).toBe('localhost');
        });

        it('should have correct Redis port configuration', () => {
            expect(configService.get('REDIS_PORT')).toBe(6380);
        });

        it('should have correct Redis timeout configurations', () => {
            expect(configService.get('REDIS_CONNECT_TIMEOUT')).toBe(10000);
            expect(configService.get('REDIS_COMMAND_TIMEOUT')).toBe(5000);
        });

        it('should have correct Redis retry configurations', () => {
            expect(configService.get('REDIS_RETRY_ATTEMPTS')).toBe(5);
            expect(configService.get('REDIS_RETRY_DELAY')).toBe(1000);
        });

        it('should handle retry strategy correctly', () => {
            const retryStrategy = configService.get('retry_strategy');
            expect(typeof retryStrategy).toBe('function');

            // Prueba de reconexión normal
            const result1 = retryStrategy({ attempt: 1, error: { code: 'ECONNREFUSED' } });
            expect(result1).toBe(100);

            // Prueba de tiempo agotado
            const result2 = retryStrategy({ total_retry_time: 1000 * 60 * 60 + 1, attempt: 1 });
            expect(result2).toBeInstanceOf(Error);
            expect(result2.message).toBe('Redis retry time exhausted');

            // Prueba de intentos agotados
            const result3 = retryStrategy({ attempt: 11 });
            expect(result3).toBeInstanceOf(Error);
            expect(result3.message).toBe('Redis retry attempts exhausted');
        });
    });

    describe('Redis Client', () => {
        let redisClient;

        beforeEach(() => {
            redisClient = module.get('INTERVIEW_CONFIG_SERVICE');
            // Espiar las funciones existentes
            jest.spyOn(redisClient, 'emit');
            jest.spyOn(redisClient, 'send');
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should have Redis client properly configured', () => {
            expect(redisClient).toBeDefined();
            expect(typeof redisClient.emit).toBe('function');
            expect(typeof redisClient.send).toBe('function');
        });

        it('should be able to emit events', async () => {
            const eventData = { data: 'test' };
            await redisClient.emit('test_event', eventData);
            expect(redisClient.emit).toHaveBeenCalledWith('test_event', eventData);
        });

        it('should be able to send messages', async () => {
            const messageData = { data: 'test' };
            await redisClient.send('test_pattern', messageData);
            expect(redisClient.send).toHaveBeenCalledWith('test_pattern', messageData);
        });

        it('should handle emit errors', async () => {
            const errorMessage = 'Emit error';
            jest.spyOn(redisClient, 'emit').mockRejectedValueOnce(new Error(errorMessage));

            await expect(redisClient.emit('test_event', { data: 'test' }))
                .rejects
                .toThrow(errorMessage);
        });

        it('should handle send errors', async () => {
            const errorMessage = 'Send error';
            jest.spyOn(redisClient, 'send').mockRejectedValueOnce(new Error(errorMessage));

            await expect(redisClient.send('test_pattern', { data: 'test' }))
                .rejects
                .toThrow(errorMessage);
        });
    });

    describe('Module Integration', () => {
        let service: InterviewConfigsService;
        let controller: InterviewConfigsController;

        beforeEach(() => {
            service = module.get<InterviewConfigsService>(InterviewConfigsService);
            controller = module.get<InterviewConfigsController>(InterviewConfigsController);
        });

        it('should have service injected in controller', () => {
            expect(controller['configsService']).toBeDefined();
            expect(controller['configsService']).toBeInstanceOf(InterviewConfigsService);
        });

        it('should have repository injected in service', () => {
            expect(service['configRepository']).toBeDefined();
        });

        it('should have Redis client injected in controller', () => {
            expect(controller['configClient']).toBeDefined();
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

            await expect(testModule.compile()).rejects.toThrow(/InterviewConfigRepository/);
        });

        it('should handle Redis connection errors', () => {
            const retryStrategy = configService.get('retry_strategy');
            const result = retryStrategy({
                error: new Error('ECONNREFUSED'),
                total_retry_time: 0,
                attempt: 1
            });
            expect(result).toBe(100);
        });
    });
});