import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) { }

    async create(createDto: CreateQuestionDto): Promise<Question> {
        const question = this.questionRepository.create(createDto);
        return await this.questionRepository.save(question);
    }

    async findAll(): Promise<Question[]> {
        return await this.questionRepository.find();
    }

    async findOne(id: string): Promise<Question> {
        const question = await this.questionRepository.findOneBy({ question_id: id });
        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }
        return question;
    }

    async update(id: string, updateDto: UpdateQuestionDto): Promise<Question> {
        const question = await this.findOne(id);
        Object.assign(question, updateDto);
        return await this.questionRepository.save(question);
    }

    async remove(id: string): Promise<void> {
        const question = await this.findOne(id);
        await this.questionRepository.remove(question);
    }

    async findByRoleAndSeniority(jobRoleId: string, seniorityId: string): Promise<Question[]> {
        return await this.questionRepository.find({
            where: {
                job_role_id: jobRoleId,
                seniority_id: seniorityId,
            },
        });
    }
}