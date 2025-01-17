import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInterviewResultDto } from './dto/create-interview-result.dto';
import { UpdateInterviewFeedbackDto } from './dto/update-interview-feedback.dto';
import { UpdateInterviewRatingDto } from './dto/update-interview-rating.dto';
import { UpdateInterviewResultDto } from './dto/update-interview-result.dto';
import { InterviewResult } from './entities/interview-result.entity';
import { InterviewResultsService } from './interview-results.service';

@ApiTags('Interview Results')
@Controller('interview-results')
export class InterviewResultsController {
    constructor(private readonly resultsService: InterviewResultsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview result' })
    @ApiResponse({
        status: 201,
        description: 'The interview result has been successfully created.',
        type: InterviewResult
    })
    create(@Body() createDto: CreateInterviewResultDto) {
        return this.resultsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all interview results' })
    @ApiResponse({
        status: 200,
        description: 'List of all interview results',
        type: [InterviewResult]
    })
    findAll() {
        return this.resultsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview result' })
    @ApiResponse({
        status: 200,
        description: 'The found interview result',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    findOne(@Param('id') id: string) {
        return this.resultsService.findOne(id);
    }

    @Get('interview/:interviewId')
    @ApiOperation({ summary: 'Get results by interview ID' })
    @ApiResponse({
        status: 200,
        description: 'List of interview results for the specified interview',
        type: [InterviewResult]
    })
    findByInterview(@Param('interviewId') interviewId: string) {
        return this.resultsService.findByInterview(interviewId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview result' })
    @ApiResponse({
        status: 200,
        description: 'The interview result has been successfully updated.',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdateInterviewResultDto
    ) {
        return this.resultsService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview result' })
    @ApiResponse({ status: 200, description: 'The interview result has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    remove(@Param('id') id: string) {
        return this.resultsService.remove(id);
    }

    @Patch(':id/rating')
    @ApiOperation({ summary: 'Update only the rating of an interview result' })
    @ApiResponse({
        status: 200,
        description: 'The rating has been successfully updated.',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    updateRating(
        @Param('id') id: string,
        @Body() ratingDto: UpdateInterviewRatingDto
    ) {
        return this.resultsService.updateRating(id, ratingDto.rating);
    }

    @Patch(':id/feedback')
    @ApiOperation({ summary: 'Update only the AI feedback of an interview result' })
    @ApiResponse({
        status: 200,
        description: 'The AI feedback has been successfully updated.',
        type: InterviewResult
    })
    @ApiResponse({ status: 404, description: 'Interview result not found' })
    updateAiFeedback(
        @Param('id') id: string,
        @Body() feedbackDto: UpdateInterviewFeedbackDto
    ) {
        return this.resultsService.updateAiFeedback(id, feedbackDto.ai_feedback);
    }
}
