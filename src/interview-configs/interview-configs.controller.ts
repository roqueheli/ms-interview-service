import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateInterviewConfigDto } from './dto/create-interview-config.dto';
import { UpdateInterviewConfigDto } from './dto/update-interview-config.dto';
import { InterviewConfigsService } from './interview-configs.service';

@ApiTags('Interview Configs')
@Controller('interview-configs')
export class InterviewConfigsController {
    constructor(
        private readonly configsService: InterviewConfigsService,
        @Inject('INTERVIEW_CONFIG_SERVICE') private readonly configClient: ClientProxy,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new interview configuration' })
    @ApiResponse({ status: 201, description: 'Config created successfully' })
    async create(@Body() createDto: CreateInterviewConfigDto) {
        // Verificar si la empresa existe
        const enterpriseExists = await firstValueFrom(
            this.configClient.send('verify_enterprise', createDto.enterprise_id)
        );

        if (!enterpriseExists) {
            throw new Error('Enterprise not found');
        }

        // Verificar si el rol existe
        const roleExists = await firstValueFrom(
            this.configClient.send('verify_job_role', createDto.job_role_id)
        );

        if (!roleExists) {
            throw new Error('Job role not found');
        }

        const config = await this.configsService.create(createDto);

        // Emitir evento de configuración creada
        this.configClient.emit('interview_config_created', {
            config,
            timestamp: new Date(),
        });

        return config;
    }

    @EventPattern('interview_config_created')
    async handleConfigCreated(data: any) {
        console.log('New interview config created:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Get()
    @ApiOperation({ summary: 'Get all interview configurations' })
    @ApiResponse({ status: 200, description: 'List of configs retrieved successfully' })
    async findAll() {
        return await this.configsService.findAll();
    }

    @Get('enterprise/:enterpriseId/role/:roleId')
    @ApiOperation({ summary: 'Get configs by enterprise and role' })
    async findByEnterpriseAndRole(
        @Param('enterpriseId') enterpriseId: string,
        @Param('roleId') roleId: string,
    ) {
        // Verificar si la empresa y el rol existen
        const [enterpriseExists, roleExists] = await Promise.all([
            firstValueFrom(this.configClient.send('verify_enterprise', enterpriseId)),
            firstValueFrom(this.configClient.send('verify_job_role', roleId))
        ]);

        if (!enterpriseExists) {
            throw new Error('Enterprise not found');
        }

        if (!roleExists) {
            throw new Error('Job role not found');
        }

        return await this.configsService.findByEnterpriseAndRole(enterpriseId, roleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific interview configuration' })
    async findOne(@Param('id') id: string) {
        return await this.configsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an interview configuration' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateInterviewConfigDto) {
        const config = await this.configsService.update(id, updateDto);

        // Emitir evento de configuración actualizada
        this.configClient.emit('interview_config_updated', {
            config,
            timestamp: new Date(),
        });

        return config;
    }

    @EventPattern('interview_config_updated')
    async handleConfigUpdated(data: any) {
        console.log('Interview config updated:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an interview configuration' })
    async remove(@Param('id') id: string) {
        await this.configsService.remove(id);

        // Emitir evento de configuración eliminada
        this.configClient.emit('interview_config_deleted', {
            config_id: id,
            timestamp: new Date(),
        });

        return { message: 'Interview configuration deleted successfully' };
    }

    @EventPattern('interview_config_deleted')
    async handleConfigDeleted(data: any) {
        console.log('Interview config deleted:', data);
        // Aquí puedes agregar lógica adicional para manejar el evento
    }

    // Manejador de mensajes para verificación de configuraciones
    @MessagePattern('verify_config')
    async verifyConfig(configId: string) {
        try {
            const config = await this.configsService.findOne(configId);
            return { exists: !!config };
        } catch (error) {
            return { exists: false };
        }
    }

    // Manejador de mensajes para obtener configuración por empresa y rol
    @MessagePattern('get_config_by_enterprise_and_role')
    async getConfigByEnterpriseAndRole(data: { enterpriseId: string, roleId: string }) {
        try {
            const config = await this.configsService.findByEnterpriseAndRole(
                data.enterpriseId,
                data.roleId
            );
            return { config, success: true };
        } catch (error) {
            return { config: null, success: false, error: error.message };
        }
    }
}