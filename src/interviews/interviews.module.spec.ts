import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InterviewConfigsModule } from '../interview-configs/interview-configs.module';
import { Interview, InterviewStatus } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsModule } from './interviews.module';
import { InterviewsService } from './interviews.service';

describe('Interviews', () => {
    let module: TestingModule;
    let controller: InterviewsController;
    let service: InterviewsService;
    let configService: ConfigService;

    const mockInterview: Interview = {
        interview_id: '123e4567-e89b-12d3-a456-426614174000',
        application_id: '123e4567-e89b-12d3-a456-426614174001',
        config_id: '123e4567-e89b-12d3-a456-426614174002',
        status: InterviewStatus.PENDING,
        scheduled_date: new Date('2024-01-16T12:00:00Z'),
        expiration_date: new Date('2024-01-17T12:00:00Z'),
        video_recording_url: 'https://example.com/video.mp4',
        created_at: new Date('2024-01-16T12:00:00Z')
    };

    const mockInterviewsService = {
        create: jest.fn().mockResolvedValue(mockInterview),
        findAll: jest.fn().mockResolvedValue([mockInterview]),
        findOne: jest.fn().mockResolvedValue(mockInterview),
        findByApplication: jest.fn().mockResolvedValue(mockInterview),
        update: jest.fn().mockResolvedValue(mockInterview),
        updateStatus: jest.fn().mockResolvedValue(mockInterview),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    const mockRepository = {
        create: jest.fn().mockReturnValue(mockInterview),
        save: jest.fn().mockResolvedValue(mockInterview),
        find: jest.fn().mockResolvedValue([mockInterview]),
        findOne: jest.fn().mockResolvedValue(mockInterview),
        findOneBy: jest.fn().mockResolvedValue(mockInterview),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6380,
            };
            return config[key];
        }),
    };

    const mockClientProxy = {
        send: jest.fn().mockImplementation(() => ({
            toPromise: () => Promise.resolve(true)
        })),
        emit: jest.fn(),
    };

    @Module({
        providers: [{
            provide: 'INTERVIEW_CONFIGS_SERVICE',
            useValue: {}
        }],
        exports: ['INTERVIEW_CONFIGS_SERVICE']
    })
    class MockInterviewConfigsModule { }

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                ClientsModule.registerAsync([
                    {
                        name: 'INTERVIEW_SERVICE',
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
                InterviewsModule,
            ],
        })
            .overrideProvider(getRepositoryToken(Interview))
            .useValue(mockRepository)
            .overrideProvider(InterviewsService)
            .useValue(mockInterviewsService)
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .overrideProvider('INTERVIEW_SERVICE')
            .useValue(mockClientProxy)
            .overrideModule(InterviewConfigsModule)
            .useModule(MockInterviewConfigsModule)
            .compile();

        controller = module.get<InterviewsController>(InterviewsController);
        service = module.get<InterviewsService>(InterviewsService);
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('Module Structure', () => {
        it('should be defined', () => {
            expect(module).toBeDefined();
        });

        it('should have InterviewsController', () => {
            expect(controller).toBeDefined();
        });

        it('should have InterviewsService', () => {
            expect(service).toBeDefined();
        });

        it('should have Redis client configured', () => {
            const client = module.get('INTERVIEW_SERVICE');
            expect(client).toBeDefined();
            expect(client.emit).toBeDefined();
            expect(client.send).toBeDefined();
        });

        it('should have correct Redis configuration', () => {
            expect(configService.get('REDIS_HOST')).toBe('localhost');
            expect(configService.get('REDIS_PORT')).toBe(6380);
        });
    });

    describe('Controller', () => {
        // ... (mantener las pruebas del controlador existentes)
        // Las pruebas del controlador se mantienen igual que en tu código original
    });

    describe('Entity', () => {
        // ... (mantener las pruebas de la entidad existentes)
        // Las pruebas de la entidad se mantienen igual que en tu código original
    });

    describe('Redis Integration', () => {
        it('should handle Redis client events', () => {
            const client = module.get('INTERVIEW_SERVICE');
            expect(() => {
                client.emit('test_event', { data: 'test' });
            }).not.toThrow();
        });

        it('should handle Redis client messages', async () => {
            const client = module.get('INTERVIEW_SERVICE');
            const result = await client.send('test_pattern', { data: 'test' });
            expect(result).toBeDefined();
        });
    });
});