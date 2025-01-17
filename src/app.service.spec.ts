import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  const mockDate = new Date('2024-01-16T12:00:00.000Z');

  beforeEach(async () => {
    // Mock Date.prototype.toISOString
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    // Restaurar el mock de Date después de cada prueba
    jest.restoreAllMocks();
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const result = service.getApiInfo();

      expect(result).toEqual({
        name: 'Interview Service API',
        version: '1.0.0',
        description: 'API for managing technical interviews',
        status: 'active',
        timestamp: mockDate.toISOString(),
      });
    });

    it('should include correct API name', () => {
      const result = service.getApiInfo();
      expect(result.name).toBe('Interview Service API');
    });

    it('should include correct API version', () => {
      const result = service.getApiInfo();
      expect(result.version).toBe('1.0.0');
    });

    it('should include correct API description', () => {
      const result = service.getApiInfo();
      expect(result.description).toBe('API for managing technical interviews');
    });

    it('should include active status', () => {
      const result = service.getApiInfo();
      expect(result.status).toBe('active');
    });

    it('should include ISO timestamp', () => {
      const result = service.getApiInfo();
      expect(result.timestamp).toBe(mockDate.toISOString());
    });
  });

  describe('getHealthCheck', () => {
    beforeEach(() => {
      // Mock process.uptime
      jest.spyOn(process, 'uptime').mockReturnValue(123.456);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return health check information', () => {
      const result = service.getHealthCheck();

      expect(result).toEqual({
        status: 'ok',
        uptime: 123.456,
        timestamp: mockDate.toISOString(),
      });
    });

    it('should include ok status', () => {
      const result = service.getHealthCheck();
      expect(result.status).toBe('ok');
    });

    it('should include uptime from process.uptime', () => {
      const result = service.getHealthCheck();
      expect(result.uptime).toBe(123.456);
    });

    it('should include ISO timestamp', () => {
      const result = service.getHealthCheck();
      expect(result.timestamp).toBe(mockDate.toISOString());
    });

    it('should return current uptime value', () => {
      jest.spyOn(process, 'uptime').mockReturnValue(456.789);
      const result = service.getHealthCheck();
      expect(result.uptime).toBe(456.789);
    });
  });

  describe('Service instantiation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be instance of AppService', () => {
      expect(service).toBeInstanceOf(AppService);
    });
  });

  describe('Return types', () => {
    it('getApiInfo should return an object with all required properties', () => {
      const result = service.getApiInfo();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    });

    it('getHealthCheck should return an object with all required properties', () => {
      const result = service.getHealthCheck();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
    });

    it('all properties should have correct types', () => {
      const apiInfo = service.getApiInfo();
      const healthCheck = service.getHealthCheck();

      // API Info types
      expect(typeof apiInfo.name).toBe('string');
      expect(typeof apiInfo.version).toBe('string');
      expect(typeof apiInfo.description).toBe('string');
      expect(typeof apiInfo.status).toBe('string');
      expect(typeof apiInfo.timestamp).toBe('string');

      // Health Check types
      expect(typeof healthCheck.status).toBe('string');
      expect(typeof healthCheck.uptime).toBe('number');
      expect(typeof healthCheck.timestamp).toBe('string');
    });
  });
});