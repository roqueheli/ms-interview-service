import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewResultDto } from './dto/create-interview-result.dto';
import { UpdateInterviewResultDto } from './dto/update-interview-result.dto';
import { InterviewResult } from './entities/interview-result.entity';

@Injectable()
export class InterviewResultsService {
    constructor(
        @InjectRepository(InterviewResult)
        private readonly resultRepository: Repository<InterviewResult>,
    ) { }

    async create(createDto: CreateInterviewResultDto): Promise<InterviewResult> {
        const result = this.resultRepository.create(createDto);
        return await this.resultRepository.save(result);
    }

    async findAll(): Promise<InterviewResult[]> {
        return await this.resultRepository.find();
    }

    async findOne(id: string): Promise<InterviewResult> {
        const result = await this.resultRepository.findOneBy({ result_id: id });
        if (!result) {
            throw new NotFoundException(`Interview result with ID ${id} not found`);
        }
        return result;
    }

    async findByInterview(interviewId: string): Promise<InterviewResult[]> {
        return await this.resultRepository.find({
            where: { interview_id: interviewId },
        });
    }

    async update(id: string, updateDto: UpdateInterviewResultDto): Promise<InterviewResult> {
        const result = await this.findOne(id);

        // Actualizar solo los campos proporcionados en el DTO
        Object.assign(result, updateDto);

        return await this.resultRepository.save(result);
    }

    async remove(id: string): Promise<void> {
        const result = await this.findOne(id);
        await this.resultRepository.remove(result);
    }

    async updateRating(id: string, rating: number): Promise<InterviewResult> {
        const result = await this.findOne(id);
        result.rating = rating;
        return await this.resultRepository.save(result);
    }

    async updateAiFeedback(id: string, feedback: string): Promise<InterviewResult> {
        const result = await this.findOne(id);
        result.ai_feedback = feedback;
        return await this.resultRepository.save(result);
    }
}