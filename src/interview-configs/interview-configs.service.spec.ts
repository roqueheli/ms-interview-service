import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewConfigDto } from './dto/create-interview-config.dto';
import { UpdateInterviewConfigDto } from './dto/update-interview-config.dto';
import { InterviewConfig } from './entities/interview-config.entity';
import { InterviewConfigsService } from './interview-configs.service';

describe('InterviewConfigsService', () => {
    let service: InterviewConfigsService;
    let repository: Repository<InterviewConfig>;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterviewConfigsService,
                {
                    provide: getRepositoryToken(InterviewConfig),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<InterviewConfigsService>(InterviewConfigsService);
        repository = module.get<Repository<InterviewConfig>>(
            getRepositoryToken(InterviewConfig),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new interview config', async () => {
            const createDto: CreateInterviewConfigDto = {
                enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                duration_minutes: 60,
                num_questions: 10,
                complexity_level: 3,
                validity_hours: 24,
            };

            const newConfig = { config_id: '1', ...createDto };

            mockRepository.create.mockReturnValue(newConfig);
            mockRepository.save.mockResolvedValue(newConfig);

            const result = await service.create(createDto);

            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(newConfig);
            expect(result).toEqual(newConfig);
        });
    });

    describe('findAll', () => {
        it('should return an array of interview configs', async () => {
            const configs = [
                {
                    config_id: '1',
                    enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                    job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                    seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                    duration_minutes: 60,
                    num_questions: 10,
                    complexity_level: 3,
                    validity_hours: 24,
                },
                {
                    config_id: '2',
                    enterprise_id: '123e4567-e89b-12d3-a456-426614174004',
                    job_role_id: '123e4567-e89b-12d3-a456-426614174005',
                    seniority_id: '123e4567-e89b-12d3-a456-426614174006',
                    duration_minutes: 45,
                    num_questions: 8,
                    complexity_level: 2,
                    validity_hours: 48,
                },
            ];

            mockRepository.find.mockResolvedValue(configs);

            const result = await service.findAll();

            expect(mockRepository.find).toHaveBeenCalled();
            expect(result).toEqual(configs);
        });
    });

    describe('findOne', () => {
        it('should return a single interview config', async () => {
            const config = {
                config_id: '1',
                enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                duration_minutes: 60,
                num_questions: 10,
                complexity_level: 3,
                validity_hours: 24,
            };

            mockRepository.findOneBy.mockResolvedValue(config);

            const result = await service.findOne('1');

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ config_id: '1' });
            expect(result).toEqual(config);
        });

        it('should throw NotFoundException when config not found', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ config_id: '1' });
        });
    });

    describe('update', () => {
        it('should update an interview config', async () => {
            const updateDto: UpdateInterviewConfigDto = {
                duration_minutes: 45,
                num_questions: 8,
                complexity_level: 2,
                validity_hours: 48,
            };

            const existingConfig = {
                config_id: '1',
                enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                duration_minutes: 60,
                num_questions: 10,
                complexity_level: 3,
                validity_hours: 24,
            };

            const updatedConfig = {
                ...existingConfig,
                ...updateDto,
            };

            mockRepository.findOneBy.mockResolvedValue(existingConfig);
            mockRepository.save.mockResolvedValue(updatedConfig);

            const result = await service.update('1', updateDto);

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ config_id: '1' });
            expect(mockRepository.save).toHaveBeenCalledWith(updatedConfig);
            expect(result).toEqual(updatedConfig);
        });

        it('should throw NotFoundException when updating non-existent config', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(
                service.update('1', { duration_minutes: 45 }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove an interview config', async () => {
            const config = {
                config_id: '1',
                enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                duration_minutes: 60,
                num_questions: 10,
                complexity_level: 3,
                validity_hours: 24,
            };

            mockRepository.findOneBy.mockResolvedValue(config);
            mockRepository.remove.mockResolvedValue(config);

            await service.remove('1');

            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ config_id: '1' });
            expect(mockRepository.remove).toHaveBeenCalledWith(config);
        });

        it('should throw NotFoundException when removing non-existent config', async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEnterpriseAndRole', () => {
        it('should return configs for specific enterprise and job role', async () => {
            const configs = [
                {
                    config_id: '1',
                    enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                    job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                    seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                    duration_minutes: 60,
                    num_questions: 10,
                    complexity_level: 3,
                    validity_hours: 24,
                },
                {
                    config_id: '2',
                    enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                    job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                    seniority_id: '123e4567-e89b-12d3-a456-426614174004',
                    duration_minutes: 45,
                    num_questions: 8,
                    complexity_level: 2,
                    validity_hours: 48,
                },
            ];

            mockRepository.find.mockResolvedValue(configs);

            const result = await service.findByEnterpriseAndRole(
                '123e4567-e89b-12d3-a456-426614174001',
                '123e4567-e89b-12d3-a456-426614174002',
            );

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                    job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                },
            });
            expect(result).toEqual(configs);
        });

        it('should return empty array when no configs found', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findByEnterpriseAndRole(
                '123e4567-e89b-12d3-a456-426614174001',
                '123e4567-e89b-12d3-a456-426614174002',
            );

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                    job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                },
            });
            expect(result).toEqual([]);
        });
    });

    describe('error handling', () => {
        it('should handle repository errors gracefully', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow('Database error');
        });

        it('should handle save operation errors', async () => {
            const createDto: CreateInterviewConfigDto = {
                enterprise_id: '123e4567-e89b-12d3-a456-426614174001',
                job_role_id: '123e4567-e89b-12d3-a456-426614174002',
                seniority_id: '123e4567-e89b-12d3-a456-426614174003',
                duration_minutes: 60,
                num_questions: 10,
                complexity_level: 3,
                validity_hours: 24,
            };

            mockRepository.create.mockReturnValue(createDto);
            mockRepository.save.mockRejectedValue(new Error('Save operation failed'));

            await expect(service.create(createDto)).rejects.toThrow(
                'Save operation failed',
            );
        });
    });
});
