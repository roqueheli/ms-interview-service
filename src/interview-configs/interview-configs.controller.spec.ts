import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInterviewConfigDto } from './dto/create-interview-config.dto';
import { UpdateInterviewConfigDto } from './dto/update-interview-config.dto';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsController } from './interview-configs.controller';
import { InterviewConfigsService } from './interview-configs.service';

describe('InterviewConfigsController', () => {
    let controller: InterviewConfigsController;
    let service: InterviewConfigsService;

    // Mock data
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

    // Mock service
    const mockConfigsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByEnterpriseAndRole: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InterviewConfigsController],
            providers: [
                {
                    provide: InterviewConfigsService,
                    useValue: mockConfigsService,
                },
            ],
        }).compile();

        controller = module.get<InterviewConfigsController>(InterviewConfigsController);
        service = module.get<InterviewConfigsService>(InterviewConfigsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new interview config', async () => {
            mockConfigsService.create.mockResolvedValue(mockConfig);

            const result = await controller.create(mockCreateDto);

            expect(result).toEqual(mockConfig);
            expect(service.create).toHaveBeenCalledWith(mockCreateDto);
            expect(service.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('findAll', () => {
        it('should return an array of interview configs', async () => {
            const mockConfigs = [mockConfig];
            mockConfigsService.findAll.mockResolvedValue(mockConfigs);

            const result = await controller.findAll();

            expect(result).toEqual(mockConfigs);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no configs exist', async () => {
            mockConfigsService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findByEnterpriseAndRole', () => {
        const enterpriseId = '123e4567-e89b-12d3-a456-426614174001';
        const roleId = '123e4567-e89b-12d3-a456-426614174002';

        it('should return configs for specific enterprise and role', async () => {
            const mockConfigs = [mockConfig];
            mockConfigsService.findByEnterpriseAndRole.mockResolvedValue(mockConfigs);

            const result = await controller.findByEnterpriseAndRole(enterpriseId, roleId);

            expect(result).toEqual(mockConfigs);
            expect(service.findByEnterpriseAndRole).toHaveBeenCalledWith(enterpriseId, roleId);
        });

        it('should return empty array when no configs found', async () => {
            mockConfigsService.findByEnterpriseAndRole.mockResolvedValue([]);

            const result = await controller.findByEnterpriseAndRole(enterpriseId, roleId);

            expect(result).toEqual([]);
            expect(service.findByEnterpriseAndRole).toHaveBeenCalledWith(enterpriseId, roleId);
        });
    });

    describe('findOne', () => {
        it('should return a single interview config', async () => {
            mockConfigsService.findOne.mockResolvedValue(mockConfig);

            const result = await controller.findOne(mockConfig.config_id);

            expect(result).toEqual(mockConfig);
            expect(service.findOne).toHaveBeenCalledWith(mockConfig.config_id);
        });

        it('should throw NotFoundException when config not found', async () => {
            mockConfigsService.findOne.mockRejectedValue(new NotFoundException());

            await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update an interview config', async () => {
            const updatedConfig = { ...mockConfig, ...mockUpdateDto };
            mockConfigsService.update.mockResolvedValue(updatedConfig);

            const result = await controller.update(mockConfig.config_id, mockUpdateDto);

            expect(result).toEqual(updatedConfig);
            expect(service.update).toHaveBeenCalledWith(mockConfig.config_id, mockUpdateDto);
        });

        it('should throw NotFoundException when updating non-existent config', async () => {
            mockConfigsService.update.mockRejectedValue(new NotFoundException());

            await expect(controller.update('non-existent-id', mockUpdateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview config', async () => {
            mockConfigsService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(mockConfig.config_id);

            expect(result).toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith(mockConfig.config_id);
        });

        it('should throw NotFoundException when removing non-existent config', async () => {
            mockConfigsService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });
});