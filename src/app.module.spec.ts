import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

// Mockear los módulos importados
jest.mock('./interview-configs/interview-configs.module', () => ({
    InterviewConfigsModule: class MockInterviewConfigsModule { },
}));

jest.mock('./interview-reports/interview-reports.module', () => ({
    InterviewReportsModule: class MockInterviewReportsModule { },
}));

jest.mock('./interview-results/interview-results.module', () => ({
    InterviewResultsModule: class MockInterviewResultsModule { },
}));

jest.mock('./interviews/interviews.module', () => ({
    InterviewsModule: class MockInterviewsModule { },
}));

jest.mock('./questions/questions.module', () => ({
    QuestionsModule: class MockQuestionsModule { },
}));

// Importar los módulos mockeados
import { AppModule } from './app.module';
import { InterviewConfigsModule } from './interview-configs/interview-configs.module';
import { InterviewReportsModule } from './interview-reports/interview-reports.module';
import { InterviewResultsModule } from './interview-results/interview-results.module';
import { InterviewsModule } from './interviews/interviews.module';
import { QuestionsModule } from './questions/questions.module';

jest.mock('@nestjs/config', () => ({
    ConfigModule: {
        forRoot: jest.fn().mockReturnValue({
            module: class ConfigModuleMock { },
            isGlobal: true,
            envFilePath: '.env',
        }),
    },
    ConfigService: jest.fn(() => ({
        get: jest.fn((key: string) => {
            const config = {
                DB_HOST: 'localhost',
                DB_PORT: 5432,
                DB_USERNAME: 'test_user',
                DB_PASSWORD: 'test_password',
                DB_NAME: 'test_db',
                NODE_ENV: 'test',
            };
            return config[key];
        }),
    })),
}));

jest.mock('@nestjs/typeorm', () => ({
    TypeOrmModule: {
        forRootAsync: jest.fn().mockReturnValue({
            module: class TypeOrmModuleMock { },
        }),
    },
}));

describe('AppModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ConfigService)
            .useValue(new ConfigService())
            .compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    describe('Module Configuration', () => {
        it('should import ConfigModule with correct configuration', () => {
            const configModuleConfig = ConfigModule.forRoot['mock'].calls[0][0];
            expect(configModuleConfig).toEqual({
                isGlobal: true,
                envFilePath: '.env',
            });
        });

        it('should import TypeOrmModule with correct configuration', () => {
            const typeOrmConfig = TypeOrmModule.forRootAsync['mock'].calls[0][0];

            expect(typeOrmConfig.imports).toContain(ConfigModule);
            expect(typeOrmConfig.inject).toContain(ConfigService);
            expect(typeof typeOrmConfig.useFactory).toBe('function');
        });

        it('should configure TypeOrm correctly based on environment', async () => {
            const typeOrmConfig = TypeOrmModule.forRootAsync['mock'].calls[0][0];
            const configService = new ConfigService();
            const config = await typeOrmConfig.useFactory(configService);

            expect(config).toEqual({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'test_user',
                password: 'test_password',
                database: 'test_db',
                entities: expect.any(Array),
                synchronize: true,
                logging: true,
            });
        });
    });

    describe('Module Imports', () => {
        it('should have all required modules imported', () => {
            const imports = Reflect.getMetadata('imports', AppModule);

            // Verificar que los módulos estén presentes en el array de imports
            const requiredModules = [
                InterviewConfigsModule,
                InterviewsModule,
                QuestionsModule,
                InterviewResultsModule,
                InterviewReportsModule,
            ];

            requiredModules.forEach(module => {
                expect(imports).toContain(module);
            });
        });
    });

    describe('Environment Configuration', () => {
        it('should disable synchronize and logging in production', async () => {
            const configService = new ConfigService();
            jest.spyOn(configService, 'get').mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return 'production';
                return 'test_value';
            });

            const typeOrmConfig = TypeOrmModule.forRootAsync['mock'].calls[0][0];
            const config = await typeOrmConfig.useFactory(configService);

            expect(config.synchronize).toBe(false);
            expect(config.logging).toBe(false);
        });

        it('should enable synchronize and logging in development', async () => {
            const configService = new ConfigService();
            jest.spyOn(configService, 'get').mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return 'development';
                return 'test_value';
            });

            const typeOrmConfig = TypeOrmModule.forRootAsync['mock'].calls[0][0];
            const config = await typeOrmConfig.useFactory(configService);

            expect(config.synchronize).toBe(true);
            expect(config.logging).toBe(true);
        });
    });

    describe('Database Configuration', () => {
        it('should load database configuration from environment variables', async () => {
            const configService = new ConfigService();
            const mockEnvVars = {
                DB_HOST: 'custom.host',
                DB_PORT: 5433,
                DB_USERNAME: 'custom_user',
                DB_PASSWORD: 'custom_password',
                DB_NAME: 'custom_db',
            };

            jest.spyOn(configService, 'get').mockImplementation((key: string) => mockEnvVars[key]);

            const typeOrmConfig = TypeOrmModule.forRootAsync['mock'].calls[0][0];
            const config = await typeOrmConfig.useFactory(configService);

            expect(config.host).toBe(mockEnvVars.DB_HOST);
            expect(config.port).toBe(mockEnvVars.DB_PORT);
            expect(config.username).toBe(mockEnvVars.DB_USERNAME);
            expect(config.password).toBe(mockEnvVars.DB_PASSWORD);
            expect(config.database).toBe(mockEnvVars.DB_NAME);
        });

        it('should configure entities path correctly', async () => {
            const typeOrmConfig = TypeOrmModule.forRootAsync['mock'].calls[0][0];
            const configService = new ConfigService();
            const config = await typeOrmConfig.useFactory(configService);

            expect(config.entities[0]).toMatch(/\**\/\*.entity{.ts,.js}$/);
        });
    });
});
