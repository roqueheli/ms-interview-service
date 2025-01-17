import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewConfigDto } from './dto/create-interview-config.dto';
import { UpdateInterviewConfigDto } from './dto/update-interview-config.dto';
import { InterviewConfig } from './entities/interview-config.entity';

@Injectable()
export class InterviewConfigsService {
    constructor(
        @InjectRepository(InterviewConfig)
        private readonly configRepository: Repository<InterviewConfig>,
    ) { }

    async create(createDto: CreateInterviewConfigDto): Promise<InterviewConfig> {
        const config = this.configRepository.create(createDto);
        return await this.configRepository.save(config);
    }

    async findAll(): Promise<InterviewConfig[]> {
        return await this.configRepository.find();
    }

    async findOne(id: string): Promise<InterviewConfig> {
        const config = await this.configRepository.findOneBy({ config_id: id });
        if (!config) {
            throw new NotFoundException(`Interview config with ID ${id} not found`);
        }
        return config;
    }

    async update(id: string, updateDto: UpdateInterviewConfigDto): Promise<InterviewConfig> {
        const config = await this.findOne(id);
        Object.assign(config, updateDto);
        return await this.configRepository.save(config);
    }

    async remove(id: string): Promise<void> {
        const config = await this.findOne(id);
        await this.configRepository.remove(config);
    }

    async findByEnterpriseAndRole(enterpriseId: string, jobRoleId: string): Promise<InterviewConfig[]> {
        return await this.configRepository.find({
            where: {
                enterprise_id: enterpriseId,
                job_role_id: jobRoleId,
            },
        });
    }
}