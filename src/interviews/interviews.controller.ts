import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { InterviewsService } from './interviews.service';

@ApiTags('Interviews')
@Controller('interviews')
export class InterviewsController {
    constructor(private readonly interviewsService: InterviewsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview' })
    create(@Body() createDto: CreateInterviewDto) {
        return this.interviewsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all interviews' })
    findAll() {
        return this.interviewsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview' })
    findOne(@Param('id') id: string) {
        return this.interviewsService.findOne(id);
    }

    @Get('application/:applicationId')
    @ApiOperation({ summary: 'Get interview by application ID' })
    findByApplication(@Param('applicationId') applicationId: string) {
        return this.interviewsService.findByApplication(applicationId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview' })
    update(@Param('id') id: string, @Body() updateDto: UpdateInterviewDto) {
        return this.interviewsService.update(id, updateDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update interview status' })
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.interviewsService.updateStatus(id, status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview' })
    remove(@Param('id') id: string) {
        return this.interviewsService.remove(id);
    }
}