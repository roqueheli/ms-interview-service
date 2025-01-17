import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInterviewReportDto } from './dto/create-interview-report.dto';
import { UpdateInterviewReportDto } from './dto/update-interview-report.dto';
import { UpdateOverallScoreDto } from './dto/update-overall-score.dto';
import { UpdateRecommendationsDto } from './dto/update-recommendations.dto';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsService } from './interview-reports.service';

@ApiTags('Interview Reports')
@Controller('interview-reports')
export class InterviewReportsController {
    constructor(private readonly reportsService: InterviewReportsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview report' })
    @ApiResponse({
        status: 201,
        description: 'The interview report has been successfully created.',
        type: InterviewReport
    })
    create(@Body() createDto: CreateInterviewReportDto) {
        return this.reportsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all interview reports' })
    @ApiResponse({
        status: 200,
        description: 'List of all interview reports',
        type: [InterviewReport]
    })
    findAll() {
        return this.reportsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview report' })
    @ApiResponse({
        status: 200,
        description: 'The found interview report',
        type: InterviewReport
    })
    @ApiResponse({ status: 404, description: 'Interview report not found' })
    findOne(@Param('id') id: string) {
        return this.reportsService.findOne(id);
    }

    @Get('interview/:interviewId')
    @ApiOperation({ summary: 'Get reports by interview ID' })
    @ApiResponse({
        status: 200,
        description: 'List of interview reports for the specified interview',
        type: [InterviewReport]
    })
    findByInterview(@Param('interviewId') interviewId: string) {
        return this.reportsService.findByInterview(interviewId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview report' })
    @ApiResponse({
        status: 200,
        description: 'The interview report has been successfully updated.',
        type: InterviewReport
    })
    @ApiResponse({ status: 404, description: 'Interview report not found' })
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdateInterviewReportDto
    ) {
        return this.reportsService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview report' })
    @ApiResponse({ status: 200, description: 'The interview report has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Interview report not found' })
    remove(@Param('id') id: string) {
        return this.reportsService.remove(id);
    }

    @Patch(':id/overall-score')
    @ApiOperation({ summary: 'Update only the overall score of an interview report' })
    @ApiResponse({
        status: 200,
        description: 'The overall score has been successfully updated.',
        type: InterviewReport
    })
    updateOverallScore(
        @Param('id') id: string,
        @Body() scoreDto: UpdateOverallScoreDto
    ) {
        return this.reportsService.updateOverallScore(id, scoreDto.overall_score);
    }

    @Patch(':id/recommendations')
    @ApiOperation({ summary: 'Update only the recommendations of an interview report' })
    @ApiResponse({
        status: 200,
        description: 'The recommendations have been successfully updated.',
        type: InterviewReport
    })
    updateRecommendations(
        @Param('id') id: string,
        @Body() recommendationsDto: UpdateRecommendationsDto
    ) {
        return this.reportsService.updateRecommendations(id, recommendationsDto.recommendations);
    }
}