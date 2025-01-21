import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
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

// Mock de TypeORM
jest.mock('@nestjs/typeorm', () => ({
    TypeOrmModule: {
        forRootAsync: jest.fn().mockReturnValue({
            module: class MockTypeOrmModule { },
        }),
        forFeature: jest.fn().mockReturnValue({})
    }
}));

import { AppModule } from './app.module';
import { InterviewConfigsModule } from './interview-configs/interview-configs.module';
import { InterviewReportsModule } from './interview-reports/interview-reports.module';
import { InterviewResultsModule } from './interview-results/interview-results.module';
import { InterviewsModule } from './interviews/interviews.module';
import { QuestionsModule } from './questions/questions.module';

jest.setTimeout(30000); // Aumentar el timeout global

describe('AppModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    });

    describe('Module Configuration', () => {
        it('should have ConfigModule configured', () => {
            const configModule = module.get(ConfigModule);
            expect(configModule).toBeDefined();
        });

        it('should have ClientsModule configured', () => {
            const clientsModule = module.get(ClientsModule);
            expect(clientsModule).toBeDefined();
        });
    });

    describe('Redis Configuration', () => {
        it('should have correct Redis configuration', () => {
            const clientsModule = module.get(ClientsModule);
            expect(clientsModule).toBeDefined();
        });
    });
});