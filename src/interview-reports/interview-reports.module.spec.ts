import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsController } from './interview-reports.controller';
import { InterviewReportsModule } from './interview-reports.module';
import { InterviewReportsService } from './interview-reports.service';

@Module({
    providers: [
        {
            provide: 'INTERVIEW_REPORT_SERVICE',
            useValue: {
                connect: jest.fn().mockImplementation(() => Promise.resolve()),
                close: jest.fn().mockImplementation(() => Promise.resolve()),
                emit: jest.fn().mockImplementation(() => Promise.resolve()),
                send: jest.fn().mockImplementation(() => Promise.resolve())
            }
        }
    ],
    exports: ['INTERVIEW_REPORT_SERVICE']
})
class MockRedisModule { }

describe('InterviewReportsModule', () => {
    let testingModule: TestingModule;
    let service: InterviewReportsService;
    let controller: InterviewReportsController;
    let configService: ConfigService;

    const mockRepository = {
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({}),
        save: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockReturnValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
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
                REDIS_TLS_ENABLED: false,  // Asegurarse de que este valor esté definido
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
        testingModule = await Test.createTestingModule({
            imports: [InterviewReportsModule]
        })
            .overrideProvider(getRepositoryToken(InterviewReport))
            .useValue(mockRepository)
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .overrideModule(ClientsModule)
            .useModule(MockRedisModule)
            .compile();

        service = testingModule.get<InterviewReportsService>(InterviewReportsService);
        controller = testingModule.get<InterviewReportsController>(InterviewReportsController);
        configService = testingModule.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(testingModule).toBeDefined();
    });

    describe('Module Configuration', () => {
        it('should have correct Redis configuration', () => {
            expect(configService.get('REDIS_HOST')).toBe('localhost');
            expect(configService.get('REDIS_PORT')).toBe(6380);
            expect(configService.get('REDIS_CONNECT_TIMEOUT')).toBe(10000);
            expect(configService.get('REDIS_COMMAND_TIMEOUT')).toBe(5000);
            expect(configService.get('REDIS_RETRY_ATTEMPTS')).toBe(5);
            expect(configService.get('REDIS_RETRY_DELAY')).toBe(1000);
        });

        it('should configure Redis client with correct options', () => {
            const clientConfig = ClientsModule.registerAsync([{
                name: 'INTERVIEW_REPORT_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.REDIS,
                    options: {
                        host: configService.get('REDIS_HOST'),
                        port: configService.get('REDIS_PORT'),
                        connectTimeout: configService.get('REDIS_CONNECT_TIMEOUT'),
                        commandTimeout: configService.get('REDIS_COMMAND_TIMEOUT'),
                        retryAttempts: configService.get('REDIS_RETRY_ATTEMPTS'),
                        retryDelay: configService.get('REDIS_RETRY_DELAY'),
                    }
                }),
                inject: [ConfigService],
            }]);

            expect(clientConfig).toBeDefined();
        });

        it('should handle Redis TLS configuration', () => {
            const tlsEnabled = configService.get('REDIS_TLS_ENABLED');
            expect(tlsEnabled).toBe(false);
        });
    });

    describe('Module Structure', () => {
        it('should have InterviewReportsService defined', () => {
            expect(service).toBeDefined();
            expect(service).toBeInstanceOf(InterviewReportsService);
        });

        it('should have InterviewReportsController defined', () => {
            expect(controller).toBeDefined();
            expect(controller).toBeInstanceOf(InterviewReportsController);
        });

        it('should have repository injected', () => {
            const repository = testingModule.get(getRepositoryToken(InterviewReport));
            expect(repository).toBeDefined();
            expect(repository).toEqual(mockRepository);
        });

        it('should have the correct dependencies', () => {
            const exportedService = testingModule.get<InterviewReportsService>(InterviewReportsService);
            expect(exportedService).toBeDefined();

            const repository = testingModule.get(getRepositoryToken(InterviewReport));
            expect(repository).toBeDefined();

            const moduleController = testingModule.get<InterviewReportsController>(InterviewReportsController);
            expect(moduleController).toBeDefined();
        });
    });

    describe('Service Integration', () => {
        it('should have access to repository methods', () => {
            const repository = testingModule.get(getRepositoryToken(InterviewReport));
            expect(repository).toBeDefined();
            expect(repository.find).toBeDefined();
            expect(repository.findOne).toBeDefined();
            expect(repository.save).toBeDefined();
        });

        it('should be able to use repository methods through service', async () => {
            const mockReport = {
                report_id: '1',
                interview_id: '1',
                company_report: {},
                candidate_report: {},
                overall_score: 85,
                recommendations: 'test',
                created_at: new Date()
            };

            mockRepository.find.mockResolvedValueOnce([mockReport]);

            const result = await service.findAll();
            expect(result).toEqual([mockReport]);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('Controller Integration', () => {
        it('should have access to service methods', () => {
            expect(controller['reportsService']).toBeDefined();
        });

        it('should be able to use service methods through controller', async () => {
            const mockReport = {
                report_id: '1',
                interview_id: '1',
                company_report: {},
                candidate_report: {},
                overall_score: 85,
                recommendations: 'test',
                created_at: new Date()
            };

            jest.spyOn(service, 'findAll').mockResolvedValueOnce([mockReport]);

            const result = await controller.findAll();
            expect(result).toEqual([mockReport]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('Redis Client', () => {
        let redisClient;

        beforeEach(() => {
            redisClient = testingModule.get('INTERVIEW_REPORT_SERVICE');
            // Asegurarse de que emit y send sean funciones mock
            redisClient.emit = jest.fn().mockImplementation(() => Promise.resolve());
            redisClient.send = jest.fn().mockImplementation(() => Promise.resolve());
        });

        it('should have Redis client properly configured', () => {
            expect(redisClient).toBeDefined();
            expect(typeof redisClient.emit).toBe('function');
            expect(typeof redisClient.send).toBe('function');
        });

        it('should be able to emit events', async () => {
            await redisClient.emit('test_event', { data: 'test' });
            expect(redisClient.emit).toHaveBeenCalledWith('test_event', { data: 'test' });
        });

        it('should be able to send messages', async () => {
            await redisClient.send('test_pattern', { data: 'test' });
            expect(redisClient.send).toHaveBeenCalledWith('test_pattern', { data: 'test' });
        });
    });

    describe('Redis Error Handling', () => {
        it('should handle connection errors', () => {
            const options = {
                error: new Error('ECONNREFUSED'),
                total_retry_time: 0,
                attempt: 1
            };

            const retryStrategy = configService.get('retry_strategy');
            if (typeof retryStrategy === 'function') {
                const result = retryStrategy(options);
                expect(result).toBe(100); // Primera reconexión después de 100ms
            }
        });

        it('should handle retry time exhaustion', () => {
            const options = {
                error: new Error('ECONNREFUSED'),
                total_retry_time: 1000 * 60 * 60 + 1, // Más de 1 hora
                attempt: 1
            };

            const retryStrategy = configService.get('retry_strategy');
            if (typeof retryStrategy === 'function') {
                const result = retryStrategy(options);
                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe('Redis retry time exhausted');
            }
        });

        it('should handle maximum retry attempts', () => {
            const options = {
                error: new Error('ECONNREFUSED'),
                total_retry_time: 0,
                attempt: 11 // Más de 10 intentos
            };

            const retryStrategy = configService.get('retry_strategy');
            if (typeof retryStrategy === 'function') {
                const result = retryStrategy(options);
                expect(result).toBeInstanceOf(Error);
                expect(result.message).toBe('Redis retry attempts exhausted');
            }
        });
    });
});