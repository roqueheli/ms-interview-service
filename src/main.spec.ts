// main.spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { bootstrap } from './main';

// Mock de los módulos externos
jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn(),
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
    const mockPort = '3003';
    const mockCorsOrigin = 'http://localhost:3000';
    let documentBuilder: MockDocumentBuilder;
    let swaggerDocument: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        app = {
            setGlobalPrefix: jest.fn(),
            useGlobalPipes: jest.fn(),
            enableCors: jest.fn(),
            listen: jest.fn().mockResolvedValue(undefined),
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

        process.env.PORT = mockPort;
        process.env.CORS_ORIGIN = mockCorsOrigin;

        (NestFactory.create as jest.Mock).mockResolvedValue(app);
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

            // Verificar que useGlobalPipes fue llamado
            expect(app.useGlobalPipes).toHaveBeenCalled();

            // Obtener el ValidationPipe que se pasó a useGlobalPipes
            const [validationPipe] = (app.useGlobalPipes as jest.Mock).mock.calls[0];

            // Verificar que es una instancia de ValidationPipe
            expect(validationPipe).toBeInstanceOf(ValidationPipe);

            // Verificar que se creó con las opciones correctas
            const validationPipeStr = JSON.stringify(validationPipe);
            expect(validationPipeStr).toContain('"whitelist":true');
            expect(validationPipeStr).toContain('"forbidNonWhitelisted":true');
        });
    });

    describe('CORS Configuration', () => {
        it('should configure CORS with environment variables', async () => {
            await bootstrap();

            expect(app.enableCors).toHaveBeenCalledWith({
                origin: mockCorsOrigin,
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                credentials: true,
            });
        });

        it('should use default CORS origin when environment variable is not set', async () => {
            delete process.env.CORS_ORIGIN;
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
            expect(documentBuilder.build)
                .toHaveBeenCalled();

            expect(SwaggerModule.createDocument)
                .toHaveBeenCalledWith(app, expect.any(Object));

            // Verificar que setup se llama con el documento creado
            expect(SwaggerModule.setup)
                .toHaveBeenCalledWith('api/docs', app, swaggerDocument);
        });
    });

    describe('Server Initialization', () => {
        it('should listen on configured port', async () => {
            await bootstrap();

            expect(app.listen).toHaveBeenCalledWith(mockPort);
            expect(console.log).toHaveBeenCalledWith(
                `Application is running on: http://localhost:${mockPort}/api`
            );
        });

        it('should use default port when PORT is not set', async () => {
            delete process.env.PORT;
            await bootstrap();

            expect(app.listen).toHaveBeenCalledWith(3003);
            expect(console.log).toHaveBeenCalledWith(
                'Application is running on: http://localhost:3003/api'
            );
        });

        it('should handle server startup errors', async () => {
            const error = new Error('Server startup failed');
            (NestFactory.create as jest.Mock).mockRejectedValue(error);

            await expect(bootstrap()).rejects.toThrow('Server startup failed');
        });
    });
});
