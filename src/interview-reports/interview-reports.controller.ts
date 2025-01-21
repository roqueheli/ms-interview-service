import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateInterviewReportDto } from './dto/create-interview-report.dto';
import { UpdateInterviewReportDto } from './dto/update-interview-report.dto';
import { UpdateOverallScoreDto } from './dto/update-overall-score.dto';
import { UpdateRecommendationsDto } from './dto/update-recommendations.dto';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsService } from './interview-reports.service';

@ApiTags('Interview Reports')
@Controller('interview-reports')
export class InterviewReportsController {
    constructor(
        private readonly reportsService: InterviewReportsService,
        @Inject('INTERVIEW_REPORT_SERVICE') private readonly reportClient: ClientProxy,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview report' })
    @ApiResponse({
        status: 201,
        description: 'The interview report has been successfully created.',
        type: InterviewReport
    })
    async create(@Body() createDto: CreateInterviewReportDto) {
        // Verificar si la entrevista existe
        const interviewExists = await firstValueFrom(
            this.reportClient.send('verify_interview', createDto.interview_id)
        );

        if (!interviewExists) {
            throw new Error('Interview not found');
        }

        const report = await this.reportsService.create(createDto);

        // Emitir evento de reporte creado
        this.reportClient.emit('interview_report_created', {
            report,
            timestamp: new Date(),
        });

        return report;
    }

    @EventPattern('interview_report_created')
    async handleReportCreated(data: any) {
        console.log('New interview report created:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Get()
    @ApiOperation({ summary: 'Get all interview reports' })
    @ApiResponse({
        status: 200,
        description: 'List of all interview reports',
        type: [InterviewReport]
    })
    async findAll() {
        return await this.reportsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview report' })
    @ApiResponse({
        status: 200,
        description: 'The found interview report',
        type: InterviewReport
    })
    @ApiResponse({ status: 404, description: 'Interview report not found' })
    async findOne(@Param('id') id: string) {
        return await this.reportsService.findOne(id);
    }

    @Get('interview/:interviewId')
    @ApiOperation({ summary: 'Get reports by interview ID' })
    @ApiResponse({
        status: 200,
        description: 'List of interview reports for the specified interview',
        type: [InterviewReport]
    })
    async findByInterview(@Param('interviewId') interviewId: string) {
        // Verificar si la entrevista existe
        const interviewExists = await firstValueFrom(
            this.reportClient.send('verify_interview', interviewId)
        );

        if (!interviewExists) {
            throw new Error('Interview not found');
        }

        return await this.reportsService.findByInterview(interviewId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview report' })
    @ApiResponse({
        status: 200,
        description: 'The interview report has been successfully updated.',
        type: InterviewReport
    })
    @ApiResponse({ status: 404, description: 'Interview report not found' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateInterviewReportDto
    ) {
        const report = await this.reportsService.update(id, updateDto);

        // Emitir evento de reporte actualizado
        this.reportClient.emit('interview_report_updated', {
            report,
            timestamp: new Date(),
        });

        return report;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview report' })
    @ApiResponse({ status: 200, description: 'The interview report has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Interview report not found' })
    async remove(@Param('id') id: string) {
        await this.reportsService.remove(id);

        // Emitir evento de reporte eliminado
        this.reportClient.emit('interview_report_deleted', {
            report_id: id,
            timestamp: new Date(),
        });

        return { message: 'Interview report deleted successfully' };
    }

    @Patch(':id/overall-score')
    @ApiOperation({ summary: 'Update only the overall score of an interview report' })
    @ApiResponse({
        status: 200,
        description: 'The overall score has been successfully updated.',
        type: InterviewReport
    })
    async updateOverallScore(
        @Param('id') id: string,
        @Body() scoreDto: UpdateOverallScoreDto
    ) {
        const report = await this.reportsService.updateOverallScore(id, scoreDto.overall_score);

        // Emitir evento de puntuación actualizada
        this.reportClient.emit('interview_report_score_updated', {
            report_id: id,
            overall_score: scoreDto.overall_score,
            timestamp: new Date(),
        });

        return report;
    }

    @Patch(':id/recommendations')
    @ApiOperation({ summary: 'Update only the recommendations of an interview report' })
    @ApiResponse({
        status: 200,
        description: 'The recommendations have been successfully updated.',
        type: InterviewReport
    })
    async updateRecommendations(
        @Param('id') id: string,
        @Body() recommendationsDto: UpdateRecommendationsDto
    ) {
        const report = await this.reportsService.updateRecommendations(
            id,
            recommendationsDto.recommendations
        );

        // Emitir evento de recomendaciones actualizadas
        this.reportClient.emit('interview_report_recommendations_updated', {
            report_id: id,
            recommendations: recommendationsDto.recommendations,
            timestamp: new Date(),
        });

        return report;
    }

    // Manejadores de eventos
    @EventPattern('interview_report_updated')
    async handleReportUpdated(data: any) {
        console.log('Interview report updated:', data);
    }

    @EventPattern('interview_report_deleted')
    async handleReportDeleted(data: any) {
        console.log('Interview report deleted:', data);
    }

    @EventPattern('interview_report_score_updated')
    async handleScoreUpdated(data: any) {
        console.log('Interview report score updated:', data);
    }

    @EventPattern('interview_report_recommendations_updated')
    async handleRecommendationsUpdated(data: any) {
        console.log('Interview report recommendations updated:', data);
    }

    // Manejador de mensajes para verificación de reportes
    @MessagePattern('verify_report')
    async verifyReport(reportId: string) {
        try {
            const report = await this.reportsService.findOne(reportId);
            return { exists: !!report };
        } catch (error) {
            return { exists: false };
        }
    }
}