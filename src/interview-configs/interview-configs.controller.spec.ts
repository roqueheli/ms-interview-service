import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { CreateInterviewConfigDto } from './dto/create-interview-config.dto';
import { UpdateInterviewConfigDto } from './dto/update-interview-config.dto';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsController } from './interview-configs.controller';
import { InterviewConfigsService } from './interview-configs.service';

describe('InterviewConfigsController', () => {
    let controller: InterviewConfigsController;
    let service: InterviewConfigsService;
    let configClient: ClientProxy;

    const mockConfig: InterviewConfig = {
        config_id: '123e4567-e89b-12d3-a456-426614174000',
        enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
        job_role_id: '123e4567-e89b-12d3-a456-426614174002',
        seniority_id: '123e4567-e89b-12d3-a456-426614174003',
        duration_minutes: 60,
        num_questions: 10,
        complexity_level: 3,
        validity_hours: 24,
        created_at: new Date(),
    };

    const mockCreateDto: CreateInterviewConfigDto = {
        enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
        job_role_id: '123e4567-e89b-12d3-a456-426614174002',
        seniority_id: '123e4567-e89b-12d3-a456-426614174003',
        duration_minutes: 60,
        num_questions: 10,
        complexity_level: 3,
        validity_hours: 24,
    };

    const mockUpdateDto: UpdateInterviewConfigDto = {
        duration_minutes: 90,
        num_questions: 15,
    };

    const mockConfigsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByEnterpriseAndRole: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockConfigClient = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewConfigsController],
            providers: [
                {
                    provide: InterviewConfigsService,
                    useValue: mockConfigsService,
                },
                {
                    provide: 'INTERVIEW_CONFIG_SERVICE',
                    useValue: mockConfigClient,
                },
            ],
        }).compile();

        controller = module.get<InterviewConfigsController>(InterviewConfigsController);
        service = module.get<InterviewConfigsService>(InterviewConfigsService);
        configClient = module.get<ClientProxy>('INTERVIEW_CONFIG_SERVICE');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        beforeEach(() => {
            mockConfigClient.send.mockImplementation((pattern, payload) => {
                if (pattern === 'verify_enterprise') return of(true);
                if (pattern === 'verify_job_role') return of(true);
                return of(false);
            });
        });

        it('should create a new interview config', async () => {
            mockConfigsService.create.mockResolvedValue(mockConfig);
            mockConfigClient.emit.mockImplementation(() => of(undefined));

            const result = await controller.create(mockCreateDto);

            expect(result).toEqual(mockConfig);
            expect(service.create).toHaveBeenCalledWith(mockCreateDto);
            expect(configClient.emit).toHaveBeenCalledWith('interview_config_created', expect.any(Object));
        });

        it('should throw error if enterprise does not exist', async () => {
            mockConfigClient.send.mockImplementation((pattern) => {
                if (pattern === 'verify_enterprise') return of(false);
                return of(true);
            });

            await expect(controller.create(mockCreateDto)).rejects.toThrow('Enterprise not found');
        });

        it('should throw error if job role does not exist', async () => {
            mockConfigClient.send.mockImplementation((pattern) => {
                if (pattern === 'verify_job_role') return of(false);
                return of(true);
            });

            await expect(controller.create(mockCreateDto)).rejects.toThrow('Job role not found');
        });
    });

    describe('findByEnterpriseAndRole', () => {
        const enterpriseId = mockConfig.enterprise_id;
        const roleId = mockConfig.job_role_id;

        beforeEach(() => {
            mockConfigClient.send.mockImplementation((pattern) => {
                if (pattern === 'verify_enterprise') return of(true);
                if (pattern === 'verify_job_role') return of(true);
                return of(false);
            });
        });

        it('should return configs for specific enterprise and role', async () => {
            const mockConfigs = [mockConfig];
            mockConfigsService.findByEnterpriseAndRole.mockResolvedValue(mockConfigs);

            const result = await controller.findByEnterpriseAndRole(enterpriseId, roleId);

            expect(result).toEqual(mockConfigs);
            expect(service.findByEnterpriseAndRole).toHaveBeenCalledWith(enterpriseId, roleId);
        });

        it('should throw error if enterprise does not exist', async () => {
            mockConfigClient.send.mockImplementation((pattern) => {
                if (pattern === 'verify_enterprise') return of(false);
                return of(true);
            });

            await expect(controller.findByEnterpriseAndRole(enterpriseId, roleId))
                .rejects.toThrow('Enterprise not found');
        });

        it('should throw error if job role does not exist', async () => {
            mockConfigClient.send.mockImplementation((pattern) => {
                if (pattern === 'verify_job_role') return of(false);
                return of(true);
            });

            await expect(controller.findByEnterpriseAndRole(enterpriseId, roleId))
                .rejects.toThrow('Job role not found');
        });
    });

    describe('update', () => {
        it('should update an interview config and emit event', async () => {
            const updatedConfig = { ...mockConfig, ...mockUpdateDto };
            mockConfigsService.update.mockResolvedValue(updatedConfig);
            mockConfigClient.emit.mockImplementation(() => of(undefined));

            const result = await controller.update(mockConfig.config_id, mockUpdateDto);

            expect(result).toEqual(updatedConfig);
            expect(service.update).toHaveBeenCalledWith(mockConfig.config_id, mockUpdateDto);
            expect(configClient.emit).toHaveBeenCalledWith('interview_config_updated', expect.any(Object));
        });
    });

    describe('remove', () => {
        it('should remove an interview config and emit event', async () => {
            mockConfigsService.remove.mockResolvedValue(undefined);
            mockConfigClient.emit.mockImplementation(() => of(undefined));

            const result = await controller.remove(mockConfig.config_id);

            expect(result).toEqual({ message: 'Interview configuration deleted successfully' });
            expect(service.remove).toHaveBeenCalledWith(mockConfig.config_id);
            expect(configClient.emit).toHaveBeenCalledWith('interview_config_deleted', expect.any(Object));
        });
    });

    describe('Message Patterns', () => {
        describe('verifyConfig', () => {
            it('should return true if config exists', async () => {
                mockConfigsService.findOne.mockResolvedValue(mockConfig);

                const result = await controller.verifyConfig(mockConfig.config_id);

                expect(result).toEqual({ exists: true });
            });

            it('should return false if config does not exist', async () => {
                mockConfigsService.findOne.mockRejectedValue(new NotFoundException());

                const result = await controller.verifyConfig('non-existent-id');

                expect(result).toEqual({ exists: false });
            });
        });

        describe('getConfigByEnterpriseAndRole', () => {
            it('should return config if found', async () => {
                mockConfigsService.findByEnterpriseAndRole.mockResolvedValue(mockConfig);

                const result = await controller.getConfigByEnterpriseAndRole({
                    enterpriseId: mockConfig.enterprise_id,
                    roleId: mockConfig.job_role_id
                });

                expect(result).toEqual({ config: mockConfig, success: true });
            });

            it('should return error if config not found', async () => {
                const errorMessage = 'Config not found';
                mockConfigsService.findByEnterpriseAndRole.mockRejectedValue(new Error(errorMessage));

                const result = await controller.getConfigByEnterpriseAndRole({
                    enterpriseId: 'non-existent',
                    roleId: 'non-existent'
                });

                expect(result).toEqual({
                    config: null,
                    success: false,
                    error: errorMessage
                });
            });
        });
    });

    // Mantener las pruebas existentes para findAll y findOne
    describe('findAll', () => {
        it('should return an array of interview configs', async () => {
            const mockConfigs = [mockConfig];
            mockConfigsService.findAll.mockResolvedValue(mockConfigs);

            const result = await controller.findAll();

            expect(result).toEqual(mockConfigs);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single interview config', async () => {
            mockConfigsService.findOne.mockResolvedValue(mockConfig);

            const result = await controller.findOne(mockConfig.config_id);

            expect(result).toEqual(mockConfig);
            expect(service.findOne).toHaveBeenCalledWith(mockConfig.config_id);
        });
    });
});
