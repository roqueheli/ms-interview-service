import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Interview Service API',
      version: '1.0.0',
      description: 'API for managing technical interviews',
      status: 'active',
      timestamp: new Date().toISOString()
    };
  }

  getHealthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}