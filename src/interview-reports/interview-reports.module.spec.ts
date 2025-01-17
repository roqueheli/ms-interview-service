import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InterviewReport } from './entities/interview-report.entity';
import { InterviewReportsController } from './interview-reports.controller';
import { InterviewReportsModule } from './interview-reports.module';
import { InterviewReportsService } from './interview-reports.service';

describe('InterviewReportsModule', () => {
    let testingModule: TestingModule;
    let service: InterviewReportsService;
    let controller: InterviewReportsController;

    // Mock del repositorio
    const mockRepository = {
        find: jest.fn().mockResolvedValue([]),
        findOne: jest.fn().mockResolvedValue({}),
        save: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockReturnValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        remove: jest.fn().mockResolvedValue({}),
    };

    beforeEach(async () => {
        testingModule = await Test.createTestingModule({
            imports: [InterviewReportsModule]
        })
            .overrideProvider(getRepositoryToken(InterviewReport))
            .useValue(mockRepository)
            .compile();

        service = testingModule.get<InterviewReportsService>(InterviewReportsService);
        controller = testingModule.get<InterviewReportsController>(InterviewReportsController);
    });

    it('should be defined', () => {
        expect(testingModule).toBeDefined();
    });

    it('should have InterviewReportsService defined', () => {
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(InterviewReportsService);
    });

    it('should have InterviewReportsController defined', () => {
        expect(controller).toBeDefined();
        expect(controller).toBeInstanceOf(InterviewReportsController);
    });

    it('should have repository injected', () => {
        const repository = testingModule.get(getRepositoryToken(InterviewReport));
        expect(repository).toBeDefined();
        expect(repository).toEqual(mockRepository);
    });

    describe('Module structure', () => {
        it('should have the correct dependencies', () => {
            const exportedService = testingModule.get<InterviewReportsService>(InterviewReportsService);
            expect(exportedService).toBeDefined();

            const repository = testingModule.get(getRepositoryToken(InterviewReport));
            expect(repository).toBeDefined();

            const moduleController = testingModule.get<InterviewReportsController>(InterviewReportsController);
            expect(moduleController).toBeDefined();
        });
    });

    describe('Service Integration', () => {
        it('should have access to repository methods', () => {
            const repository = testingModule.get(getRepositoryToken(InterviewReport));
            expect(repository).toBeDefined();
            expect(repository.find).toBeDefined();
            expect(repository.findOne).toBeDefined();
            expect(repository.save).toBeDefined();
        });

        // Prueba los métodos del servicio
        it('should be able to use repository methods through service', async () => {
            // Configurar el mock para devolver datos de prueba
            const mockReport = {
                report_id: '1',
                interview_id: '1',
                company_report: {},
                candidate_report: {},
                overall_score: 85,
                recommendations: 'test',
                created_at: new Date()
            };

            mockRepository.find.mockResolvedValueOnce([mockReport]);

            // Probar el método findAll del servicio
            const result = await service.findAll();
            expect(result).toEqual([mockReport]);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('Controller Integration', () => {
        it('should have access to service methods', () => {
            expect(controller['reportsService']).toBeDefined();
        });

        it('should be able to use service methods through controller', async () => {
            const mockReport = {
                report_id: '1',
                interview_id: '1',
                company_report: {},
                candidate_report: {},
                overall_score: 85,
                recommendations: 'test',
                created_at: new Date()
            };

            // Configurar el mock del servicio para el controlador
            jest.spyOn(service, 'findAll').mockResolvedValueOnce([mockReport]);

            // Probar el método findAll del controlador
            const result = await controller.findAll();
            expect(result).toEqual([mockReport]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });
});
