import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { redisConfig } from './config/redis.config';
import { bootstrap } from './main';

// Mock de los módulos externos
jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn(),
    },
}));

// Mock de ConfigService
const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue: any) => {
        const config = {
            PORT: '3003',
            CORS_ORIGIN: 'http://localhost:3000',
        };
        return config[key] || defaultValue;
    }),
};

// Mock de redisConfig
jest.mock('./config/redis.config', () => ({
    redisConfig: {
        host: 'localhost',
        port: 6380,
    },
}));

// Crear una clase mock para DocumentBuilder
class MockDocumentBuilder {
    setTitle() { return this; }
    setDescription() { return this; }
    setVersion() { return this; }
    addBearerAuth() { return this; }
    build() { return {}; }
}

jest.mock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockImplementation(() => new MockDocumentBuilder()),
    SwaggerModule: {
        createDocument: jest.fn(),
        setup: jest.fn(),
    },
}));

// Mock del AppModule
jest.mock('./app.module', () => ({
    AppModule: class MockAppModule { },
}));

describe('Bootstrap', () => {
    let app: INestApplication;
    let documentBuilder: MockDocumentBuilder;
    let swaggerDocument: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        app = {
            setGlobalPrefix: jest.fn().mockReturnThis(),
            useGlobalPipes: jest.fn().mockReturnThis(),
            enableCors: jest.fn().mockReturnThis(),
            listen: jest.fn().mockResolvedValue(undefined),
            connectMicroservice: jest.fn().mockReturnThis(),
            startAllMicroservices: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockReturnValue(mockConfigService),
        } as any;

        documentBuilder = new MockDocumentBuilder();
        jest.spyOn(documentBuilder, 'setTitle').mockReturnThis();
        jest.spyOn(documentBuilder, 'setDescription').mockReturnThis();
        jest.spyOn(documentBuilder, 'setVersion').mockReturnThis();
        jest.spyOn(documentBuilder, 'addBearerAuth').mockReturnThis();
        jest.spyOn(documentBuilder, 'build').mockReturnValue({});

        swaggerDocument = {};
        (DocumentBuilder as jest.Mock).mockImplementation(() => documentBuilder);
        (SwaggerModule.createDocument as jest.Mock).mockReturnValue(swaggerDocument);

        jest.spyOn(console, 'log').mockImplementation();

        (NestFactory.create as jest.Mock).mockResolvedValue(app);
    });

    describe('Redis Configuration', () => {
        it('should configure Redis microservice', async () => {
            await bootstrap();

            expect(app.connectMicroservice).toHaveBeenCalledWith<[MicroserviceOptions]>({
                transport: Transport.REDIS,
                options: {
                    host: redisConfig.host,
                    port: redisConfig.port,
                },
            });
        });

        it('should start microservices', async () => {
            await bootstrap();

            expect(app.startAllMicroservices).toHaveBeenCalled();
        });

        it('should log Redis microservice status', async () => {
            await bootstrap();

            expect(console.log).toHaveBeenCalledWith('📮 Redis microservice is running');
        });
    });

    describe('Application Setup', () => {
        it('should create NestJS application', async () => {
            await bootstrap();
            expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
        });

        it('should set global prefix', async () => {
            await bootstrap();
            expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
        });

        it('should configure validation pipe', async () => {
            await bootstrap();
            expect(app.useGlobalPipes).toHaveBeenCalledWith(
                expect.any(ValidationPipe)
            );
        });

        it('should configure validation pipe with correct options', async () => {
            await bootstrap();
            const [validationPipe] = (app.useGlobalPipes as jest.Mock).mock.calls[0];
            expect(validationPipe).toBeInstanceOf(ValidationPipe);

            // Verificar las opciones individualmente
            expect(validationPipe.validatorOptions.whitelist).toBe(true);
            expect(validationPipe.validatorOptions.forbidNonWhitelisted).toBe(true);
            expect(validationPipe.isTransformEnabled).toBe(true);
        });
    });

    describe('CORS Configuration', () => {
        it('should configure CORS with environment variables', async () => {
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'CORS_ORIGIN') return 'http://localhost:3000';
                return undefined;
            });

            await bootstrap();

            expect(app.enableCors).toHaveBeenCalledWith({
                origin: 'http://localhost:3000',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                credentials: true,
            });
        });

        it('should use default CORS origin when environment variable is not set', async () => {
            mockConfigService.get.mockImplementation((key: string, defaultValue: any) => {
                if (key === 'CORS_ORIGIN') return defaultValue;
                return undefined;
            });

            await bootstrap();

            expect(app.enableCors).toHaveBeenCalledWith({
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                credentials: true,
            });
        });
    });

    describe('Swagger Configuration', () => {
        it('should configure Swagger with correct options', async () => {
            await bootstrap();

            expect(documentBuilder.setTitle)
                .toHaveBeenCalledWith('Interview Service API');
            expect(documentBuilder.setDescription)
                .toHaveBeenCalledWith('API for managing technical interviews');
            expect(documentBuilder.setVersion)
                .toHaveBeenCalledWith('1.0.0');
            expect(documentBuilder.addBearerAuth)
                .toHaveBeenCalled();
            expect(SwaggerModule.createDocument)
                .toHaveBeenCalledWith(app, expect.any(Object));
            expect(SwaggerModule.setup)
                .toHaveBeenCalledWith('api/docs', app, swaggerDocument);
        });
    });

    describe('Server Initialization', () => {
        it('should listen on configured port', async () => {
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'PORT') return 3003;
                return undefined;
            });

            await bootstrap();

            expect(app.listen).toHaveBeenCalledWith(3003);
            expect(console.log).toHaveBeenCalledWith(
                '🚀 HTTP server running on: http://localhost:3003/api'
            );
        });

        it('should use default port when PORT is not set', async () => {
            mockConfigService.get.mockImplementation((key: string, defaultValue: any) => {
                if (key === 'PORT') return defaultValue;
                return undefined;
            });

            await bootstrap();

            expect(app.listen).toHaveBeenCalledWith(3003);
            expect(console.log).toHaveBeenCalledWith(
                '🚀 HTTP server running on: http://localhost:3003/api'
            );
        });

        it('should log Swagger documentation URL', async () => {
            await bootstrap();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('📚 Swagger documentation available at:')
            );
        });

        it('should handle server startup errors', async () => {
            const error = new Error('Server startup failed');
            (NestFactory.create as jest.Mock).mockRejectedValue(error);

            await expect(bootstrap()).rejects.toThrow('Server startup failed');
        });
    });
});
