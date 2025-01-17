import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInterviewConfigDto } from './dto/create-interview-config.dto';
import { UpdateInterviewConfigDto } from './dto/update-interview-config.dto';
import { InterviewConfigsService } from './interview-configs.service';

@ApiTags('Interview Configs')
@Controller('interview-configs')
export class InterviewConfigsController {
    constructor(private readonly configsService: InterviewConfigsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview configuration' })
    @ApiResponse({ status: 201, description: 'Config created successfully' })
    create(@Body() createDto: CreateInterviewConfigDto) {
        return this.configsService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all interview configurations' })
    @ApiResponse({ status: 200, description: 'List of configs retrieved successfully' })
    findAll() {
        return this.configsService.findAll();
    }

    @Get('enterprise/:enterpriseId/role/:roleId')
    @ApiOperation({ summary: 'Get configs by enterprise and role' })
    findByEnterpriseAndRole(
        @Param('enterpriseId') enterpriseId: string,
        @Param('roleId') roleId: string,
    ) {
        return this.configsService.findByEnterpriseAndRole(enterpriseId, roleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview configuration' })
    findOne(@Param('id') id: string) {
        return this.configsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview configuration' })
    update(@Param('id') id: string, @Body() updateDto: UpdateInterviewConfigDto) {
        return this.configsService.update(id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview configuration' })
    remove(@Param('id') id: string) {
        return this.configsService.remove(id);
    }
}