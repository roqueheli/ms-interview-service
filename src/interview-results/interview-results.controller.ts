import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateInterviewResultDto } from './dto/create-interview-result.dto';
import { UpdateInterviewFeedbackDto } from './dto/update-interview-feedback.dto';
import { UpdateInterviewRatingDto } from './dto/update-interview-rating.dto';
import { UpdateInterviewResultDto } from './dto/update-interview-result.dto';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsService } from './interview-results.service';

@ApiTags('Interview Results')
@Controller('interview-results')
export class InterviewResultsController {
    constructor(
        private readonly resultsService: InterviewResultsService,
        @Inject('INTERVIEW_RESULT_SERVICE') private readonly resultClient: ClientProxy,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview result' })
    @ApiResponse({
        status: 201,
        description: 'The interview result has been successfully created.',
        type: InterviewResult
    })
    async create(@Body() createDto: CreateInterviewResultDto) {
        // Verificar si la entrevista existe
        const interviewExists = await firstValueFrom(
            this.resultClient.send('verify_interview', createDto.interview_id)
        );

        if (!interviewExists) {
            throw new Error('Interview not found');
        }

        // Verificar si la pregunta existe
        const questionExists = await firstValueFrom(
            this.resultClient.send('verify_question', createDto.question_id)
        );

        if (!questionExists) {
            throw new Error('Question not found');
        }

        const result = await this.resultsService.create(createDto);

        // Emitir evento de resultado creado
        this.resultClient.emit('interview_result_created', {
            result,
            timestamp: new Date(),
        });

        return result;
    }

    @EventPattern('interview_result_created')
    async handleResultCreated(data: any) {
        console.log('New interview result created:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Get()
    @ApiOperation({ summary: 'Get all interview results' })
    @ApiResponse({
        status: 200,
        description: 'List of all interview results',
        type: [InterviewResult]
    })
    async findAll() {
        return await this.resultsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview result' })
    @ApiResponse({
        status: 200,
        description: 'The found interview result',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    async findOne(@Param('id') id: string) {
        return await this.resultsService.findOne(id);
    }

    @Get('interview/:interviewId')
    @ApiOperation({ summary: 'Get results by interview ID' })
    @ApiResponse({
        status: 200,
        description: 'List of interview results for the specified interview',
        type: [InterviewResult]
    })
    async findByInterview(@Param('interviewId') interviewId: string) {
        // Verificar si la entrevista existe
        const interviewExists = await firstValueFrom(
            this.resultClient.send('verify_interview', interviewId)
        );

        if (!interviewExists) {
            throw new Error('Interview not found');
        }

        return await this.resultsService.findByInterview(interviewId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview result' })
    @ApiResponse({
        status: 200,
        description: 'The interview result has been successfully updated.',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateInterviewResultDto
    ) {
        const result = await this.resultsService.update(id, updateDto);

        // Emitir evento de resultado actualizado
        this.resultClient.emit('interview_result_updated', {
            result,
            timestamp: new Date(),
        });

        return result;
    }

    @EventPattern('interview_result_updated')
    async handleResultUpdated(data: any) {
        console.log('Interview result updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview result' })
    @ApiResponse({ status: 200, description: 'The interview result has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    async remove(@Param('id') id: string) {
        await this.resultsService.remove(id);

        // Emitir evento de resultado eliminado
        this.resultClient.emit('interview_result_deleted', {
            result_id: id,
            timestamp: new Date(),
        });

        return { message: 'Interview result deleted successfully' };
    }

    @EventPattern('interview_result_deleted')
    async handleResultDeleted(data: any) {
        console.log('Interview result deleted:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Patch(':id/rating')
    @ApiOperation({ summary: 'Update only the rating of an interview result' })
    @ApiResponse({
        status: 200,
        description: 'The rating has been successfully updated.',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    async updateRating(
        @Param('id') id: string,
        @Body() ratingDto: UpdateInterviewRatingDto
    ) {
        const result = await this.resultsService.updateRating(id, ratingDto.rating);

        // Emitir evento de calificación actualizada
        this.resultClient.emit('interview_result_rating_updated', {
            result_id: id,
            rating: ratingDto.rating,
            timestamp: new Date(),
        });

        return result;
    }

    @EventPattern('interview_result_rating_updated')
    async handleRatingUpdated(data: any) {
        console.log('Interview result rating updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Patch(':id/feedback')
    @ApiOperation({ summary: 'Update only the AI feedback of an interview result' })
    @ApiResponse({
        status: 200,
        description: 'The AI feedback has been successfully updated.',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    async updateAiFeedback(
        @Param('id') id: string,
        @Body() feedbackDto: UpdateInterviewFeedbackDto
    ) {
        const result = await this.resultsService.updateAiFeedback(id, feedbackDto.ai_feedback);

        // Emitir evento de feedback actualizado
        this.resultClient.emit('interview_result_feedback_updated', {
            result_id: id,
            feedback: feedbackDto.ai_feedback,
            timestamp: new Date(),
        });

        return result;
    }

    @EventPattern('interview_result_feedback_updated')
    async handleFeedbackUpdated(data: any) {
        console.log('Interview result feedback updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    // Manejador de mensajes para verificación de resultados
    @MessagePattern('verify_result')
    async verifyResult(resultId: string) {
        try {
            const result = await this.resultsService.findOne(resultId);
            return { exists: !!result };
        } catch (error) {
            return { exists: false };
        }
    }
}
