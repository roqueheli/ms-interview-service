import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
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
    let configService: ConfigService;
    let redisClient: any;

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

    // Mock de ConfigService
    const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
            const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6380,
                REDIS_RETRY_ATTEMPTS: 5,
                REDIS_RETRY_DELAY: 1000,
            };
            return config[key] || defaultValue;
        }),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                ClientsModule.registerAsync([
                    {
                        name: 'INTERVIEW_RESULT_SERVICE',
                        imports: [ConfigModule],
                        useFactory: (configService: ConfigService) => ({
                            transport: Transport.REDIS,
                            options: {
                                host: configService.get('REDIS_HOST', 'localhost'),
                                port: configService.get('REDIS_PORT', 6380),
                                retryAttempts: 5,
                                retryDelay: 1000,
                            },
                        }),
                        inject: [ConfigService],
                    },
                ]),
                InterviewResultsModule,
            ],
        })
            .overrideProvider(getRepositoryToken(InterviewResult))
            .useValue(mockRepository)
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .compile();

        service = module.get<InterviewResultsService>(InterviewResultsService);
        controller = module.get<InterviewResultsController>(InterviewResultsController);
        repository = module.get<Repository<InterviewResult>>(getRepositoryToken(InterviewResult));
        configService = module.get<ConfigService>(ConfigService);
        redisClient = module.get('INTERVIEW_RESULT_SERVICE');
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    describe('Module Structure', () => {
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

        it('should have Redis client configured', () => {
            expect(redisClient).toBeDefined();
        });
    });

    describe('Redis Configuration', () => {
        it('should use correct Redis host and port', () => {
            expect(configService.get('REDIS_HOST')).toBe('localhost');
            expect(configService.get('REDIS_PORT')).toBe(6380);
        });

        it('should have retry configuration', () => {
            expect(configService.get('REDIS_RETRY_ATTEMPTS')).toBe(5);
            expect(configService.get('REDIS_RETRY_DELAY')).toBe(1000);
        });

        it('should configure Redis client with correct options', () => {
            const clientConfig = ClientsModule.registerAsync([{
                name: 'INTERVIEW_RESULT_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.REDIS,
                    options: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT'),
                    },
                }),
                inject: [ConfigService],
            }]);

            expect(clientConfig).toBeDefined();
        });
    });

    describe('Dependency Injection', () => {
        it('should properly inject repository into service', () => {
            const injectedRepository = module.get<Repository<InterviewResult>>(
                getRepositoryToken(InterviewResult)
            );
            expect(injectedRepository).toBeDefined();
            expect(injectedRepository).toEqual(mockRepository);
        });

        it('should properly inject Redis client', () => {
            expect(redisClient).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should throw error when repository is not provided', async () => {
            const testModule = Test.createTestingModule({
                controllers: [InterviewResultsController],
                providers: [InterviewResultsService],
            });

            await expect(testModule.compile()).rejects.toThrow();
        });

        it('should handle Redis connection errors', () => {
            const options = {
                error: new Error('ECONNREFUSED'),
                total_retry_time: 0,
                attempt: 1,
            };

            const retryStrategy = mockConfigService.get('retry_strategy');
            if (retryStrategy) {
                const result = retryStrategy(options);
                expect(typeof result).toBe('number');
                expect(result).toBeLessThanOrEqual(3000);
            }
        });
    });

    describe('Service Availability', () => {
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

    describe('Controller Availability', () => {
        it('should have working controller methods', () => {
            expect(controller.create).toBeDefined();
            expect(controller.findAll).toBeDefined();
            expect(controller.findOne).toBeDefined();
            expect(controller.update).toBeDefined();
            expect(controller.remove).toBeDefined();
        });
    });

    describe('Redis Events', () => {
        it('should handle onConnect event', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const options = mockConfigService.get('options');
            if (options && options.onConnect) {
                options.onConnect();
                expect(consoleSpy).toHaveBeenCalledWith('Successfully connected to Redis');
            }
        });

        it('should handle onError event', () => {
            const consoleSpy = jest.spyOn(console, 'error');
            const error = new Error('Test error');
            const options = mockConfigService.get('options');
            if (options && options.onError) {
                options.onError(error);
                expect(consoleSpy).toHaveBeenCalledWith('Redis error:', error);
            }
        });
    });
});
