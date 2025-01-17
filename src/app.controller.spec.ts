import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  const mockAppService = {
    getHealthCheck: jest.fn().mockReturnValue({
      status: 'ok',
      uptime: 123.45,
      timestamp: '2024-01-16T12:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockDate = new Date('2024-01-16T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = controller.getApiInfo();

      expect(result).toEqual({
        name: 'Interview Service API',
        version: '1.0.0',
        description: 'API for managing technical interviews',
        status: 'active',
        environment: 'development',
        timestamp: mockDate.toISOString(),
        endpoints: {
          interviews: '/api/interviews',
          results: '/api/interview-results',
          reports: '/api/interview-reports',
          questions: '/api/questions',
        },
        documentation: '/api',
        contact: {
          email: 'support@example.com',
          website: 'https://example.com',
        },
      });

      jest.spyOn(global, 'Date').mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getHealthCheck', () => {
    it('should return health check information', () => {
      const result = controller.getHealthCheck();

      expect(result).toEqual({
        status: 'ok',
        uptime: 123.45,
        timestamp: '2024-01-16T12:00:00.000Z',
      });
    });

    it('should call appService.getHealthCheck', () => {
      controller.getHealthCheck();

      expect(service.getHealthCheck).toHaveBeenCalled();
    });
  });
});
