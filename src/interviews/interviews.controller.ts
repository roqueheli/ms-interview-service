import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { InterviewsService } from './interviews.service';

@ApiTags('Interviews')
@Controller('interviews')
export class InterviewsController {
    constructor(
        private readonly interviewsService: InterviewsService,
        @Inject('INTERVIEW_SERVICE') private readonly interviewClient: ClientProxy,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview' })
    @ApiResponse({ status: 201, description: 'Interview created successfully' })
    async create(@Body() createDto: CreateInterviewDto) {
        // Verificar si la aplicación existe
        const applicationExists = await firstValueFrom(
            this.interviewClient.send('verify_application', createDto.application_id)
        );

        if (!applicationExists) {
            throw new Error('Application not found');
        }

        const interview = await this.interviewsService.create(createDto);

        // Emitir evento de entrevista creada
        this.interviewClient.emit('interview_created', {
            interview,
            timestamp: new Date(),
        });

        return interview;
    }

    @EventPattern('interview_created')
    async handleInterviewCreated(data: any) {
        console.log('New interview created:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Get()
    @ApiOperation({ summary: 'Get all interviews' })
    @ApiResponse({ status: 200, description: 'List of all interviews' })
    async findAll() {
        return await this.interviewsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview' })
    @ApiResponse({ status: 200, description: 'Interview found' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async findOne(@Param('id') id: string) {
        return await this.interviewsService.findOne(id);
    }

    @Get('application/:applicationId')
    @ApiOperation({ summary: 'Get interview by application ID' })
    @ApiResponse({ status: 200, description: 'Interview found' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async findByApplication(@Param('applicationId') applicationId: string) {
        // Verificar si la aplicación existe
        const applicationExists = await firstValueFrom(
            this.interviewClient.send('verify_application', applicationId)
        );

        if (!applicationExists) {
            throw new Error('Application not found');
        }

        return await this.interviewsService.findByApplication(applicationId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview' })
    @ApiResponse({ status: 200, description: 'Interview updated successfully' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateInterviewDto) {
        const interview = await this.interviewsService.update(id, updateDto);

        // Emitir evento de entrevista actualizada
        this.interviewClient.emit('interview_updated', {
            interview,
            timestamp: new Date(),
        });

        return interview;
    }

    @EventPattern('interview_updated')
    async handleInterviewUpdated(data: any) {
        console.log('Interview updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update interview status' })
    @ApiResponse({ status: 200, description: 'Interview status updated successfully' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        const interview = await this.interviewsService.updateStatus(id, status);

        // Emitir evento de estado de entrevista actualizado
        this.interviewClient.emit('interview_status_updated', {
            interview_id: id,
            status,
            timestamp: new Date(),
        });

        return interview;
    }

    @EventPattern('interview_status_updated')
    async handleInterviewStatusUpdated(data: any) {
        console.log('Interview status updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview' })
    @ApiResponse({ status: 200, description: 'Interview deleted successfully' })
    @ApiResponse({ status: 404, description: 'Interview not found' })
    async remove(@Param('id') id: string) {
        await this.interviewsService.remove(id);

        // Emitir evento de entrevista eliminada
        this.interviewClient.emit('interview_deleted', {
            interview_id: id,
            timestamp: new Date(),
        });

        return { message: 'Interview deleted successfully' };
    }

    @EventPattern('interview_deleted')
    async handleInterviewDeleted(data: any) {
        console.log('Interview deleted:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    // Manejador de mensajes para verificación de entrevistas
    @MessagePattern('verify_interview')
    async verifyInterview(interviewId: string) {
        try {
            const interview = await this.interviewsService.findOne(interviewId);
            return { exists: !!interview };
        } catch (error) {
            return { exists: false };
        }
    }
}