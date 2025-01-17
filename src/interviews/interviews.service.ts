import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewConfigsService } from '../interview-configs/interview-configs.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview, InterviewStatus } from './entities/interview.entity';

@Injectable()
export class InterviewsService {
    constructor(
        @InjectRepository(Interview)
        private readonly interviewRepository: Repository<Interview>,
        private readonly configsService: InterviewConfigsService,
    ) { }

    async create(createDto: CreateInterviewDto): Promise<Interview> {
        // Verificar que la configuración existe
        await this.configsService.findOne(createDto.config_id);

        const interview = this.interviewRepository.create(createDto);
        return await this.interviewRepository.save(interview);
    }

    async findAll(): Promise<Interview[]> {
        return await this.interviewRepository.find();
    }

    async findOne(id: string): Promise<Interview> {
        const interview = await this.interviewRepository.findOneBy({ interview_id: id });
        if (!interview) {
            throw new NotFoundException(`Interview with ID ${id} not found`);
        }
        return interview;
    }

    async update(id: string, updateDto: UpdateInterviewDto): Promise<Interview> {
        const interview = await this.findOne(id);
        Object.assign(interview, updateDto);
        return await this.interviewRepository.save(interview);
    }

    async remove(id: string): Promise<void> {
        const interview = await this.findOne(id);
        await this.interviewRepository.remove(interview);
    }

    async findByApplication(applicationId: string): Promise<Interview> {
        const interview = await this.interviewRepository.findOneBy({ application_id: applicationId });
        if (!interview) {
            throw new NotFoundException(`Interview for application ${applicationId} not found`);
        }
        return interview;
    }

    async updateStatus(id: string, status: string): Promise<Interview> {
        const interview = await this.findOne(id);
        interview.status = status as InterviewStatus;
        return await this.interviewRepository.save(interview);
    }
}