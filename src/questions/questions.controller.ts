import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new question' })
    create(@Body() createDto: CreateQuestionDto) {
        return this.questionsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all questions' })
    findAll() {
        return this.questionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific question' })
    findOne(@Param('id') id: string) {
        return this.questionsService.findOne(id);
    }

    @Get('role/:roleId/seniority/:seniorityId')
    @ApiOperation({ summary: 'Get questions by role and seniority' })
    findByRoleAndSeniority(
        @Param('roleId') roleId: string,
        @Param('seniorityId') seniorityId: string,
    ) {
        return this.questionsService.findByRoleAndSeniority(roleId, seniorityId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a question' })
    update(@Param('id') id: string, @Body() updateDto: UpdateQuestionDto) {
        return this.questionsService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a question' })
    remove(@Param('id') id: string) {
        return this.questionsService.remove(id);
    }
}