import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService,
        @Inject('QUESTION_SERVICE') private readonly questionClient: ClientProxy,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new question' })
    @ApiResponse({ status: 201, description: 'Question created successfully' })
    async create(@Body() createDto: CreateQuestionDto) {
        // Verificar si el rol y nivel de seniority existen
        const [roleExists, seniorityExists] = await Promise.all([
            firstValueFrom(
                this.questionClient.send('verify_job_role', createDto.job_role_id)
            ),
            firstValueFrom(
                this.questionClient.send('verify_seniority_level', createDto.seniority_id)
            ),
        ]);

        if (!roleExists) {
            throw new Error('Job role not found');
        }

        if (!seniorityExists) {
            throw new Error('Seniority level not found');
        }

        const question = await this.questionsService.create(createDto);

        // Emitir evento de pregunta creada
        this.questionClient.emit('question_created', {
            question,
            timestamp: new Date(),
        });

        return question;
    }

    @EventPattern('question_created')
    async handleQuestionCreated(data: any) {
        console.log('New question created:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Get()
    @ApiOperation({ summary: 'Get all questions' })
    @ApiResponse({ status: 200, description: 'List of all questions' })
    async findAll() {
        return await this.questionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific question' })
    @ApiResponse({ status: 200, description: 'Question found' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async findOne(@Param('id') id: string) {
        return await this.questionsService.findOne(id);
    }

    @Get('role/:roleId/seniority/:seniorityId')
    @ApiOperation({ summary: 'Get questions by role and seniority' })
    @ApiResponse({ status: 200, description: 'Questions found' })
    @ApiResponse({ status: 404, description: 'Role or seniority not found' })
    async findByRoleAndSeniority(
        @Param('roleId') roleId: string,
        @Param('seniorityId') seniorityId: string,
    ) {
        // Verificar si el rol y nivel de seniority existen
        const [roleExists, seniorityExists] = await Promise.all([
            firstValueFrom(
                this.questionClient.send('verify_job_role', roleId)
            ),
            firstValueFrom(
                this.questionClient.send('verify_seniority_level', seniorityId)
            ),
        ]);

        if (!roleExists) {
            throw new Error('Job role not found');
        }

        if (!seniorityExists) {
            throw new Error('Seniority level not found');
        }

        return await this.questionsService.findByRoleAndSeniority(roleId, seniorityId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a question' })
    @ApiResponse({ status: 200, description: 'Question updated successfully' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateQuestionDto) {
        const question = await this.questionsService.update(id, updateDto);

        // Emitir evento de pregunta actualizada
        this.questionClient.emit('question_updated', {
            question,
            timestamp: new Date(),
        });

        return question;
    }

    @EventPattern('question_updated')
    async handleQuestionUpdated(data: any) {
        console.log('Question updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a question' })
    @ApiResponse({ status: 200, description: 'Question deleted successfully' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async remove(@Param('id') id: string) {
        await this.questionsService.remove(id);

        // Emitir evento de pregunta eliminada
        this.questionClient.emit('question_deleted', {
            question_id: id,
            timestamp: new Date(),
        });

        return { message: 'Question deleted successfully' };
    }

    @EventPattern('question_deleted')
    async handleQuestionDeleted(data: any) {
        console.log('Question deleted:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    // Manejador de mensajes para verificación de preguntas
    @MessagePattern('verify_question')
    async verifyQuestion(questionId: string) {
        try {
            const question = await this.questionsService.findOne(questionId);
            return { exists: !!question };
        } catch (error) {
            return { exists: false };
        }
    }

    // Manejador de mensajes para obtener preguntas por rol y seniority
    @MessagePattern('get_questions_by_role_and_seniority')
    async getQuestionsByRoleAndSeniority(data: { roleId: string, seniorityId: string }) {
        try {
            const questions = await this.questionsService.findByRoleAndSeniority(
                data.roleId,
                data.seniorityId
            );
            return { questions, success: true };
        } catch (error) {
            return { questions: [], success: false, error: error.message };
        }
    }
}