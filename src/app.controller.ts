import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({
    status: 200,
    description: 'Returns API information and status',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Interview Service API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'API for managing technical interviews' },
        status: { type: 'string', example: 'active' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  getApiInfo() {
    return {
      name: 'Interview Service API',
      version: '1.0.0',
      description: 'API for managing technical interviews',
      status: 'active',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        interviews: '/api/interviews',
        results: '/api/interview-results',
        reports: '/api/interview-reports',
        questions: '/api/questions'
      },
      documentation: '/api',  // URL de Swagger
      contact: {
        email: 'support@example.com',
        website: 'https://example.com'
      }
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of the API',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 123.45 },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }
}