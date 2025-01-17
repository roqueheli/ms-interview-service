import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateOverallScoreDto } from './update-overall-score.dto';

describe('UpdateOverallScoreDto', () => {
    let dto: UpdateOverallScoreDto;

    beforeEach(() => {
        dto = new UpdateOverallScoreDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('overall_score validation', () => {
        it('should accept a valid score within range', async () => {
            const validScores = [0, 50, 87.5, 100];

            for (const score of validScores) {
                const testDto = plainToInstance(UpdateOverallScoreDto, {
                    overall_score: score
                });
                const errors = await validate(testDto);
                expect(errors).toHaveLength(0);
            }
        });

        it('should accept decimal scores within range', async () => {
            const testDto = plainToInstance(UpdateOverallScoreDto, {
                overall_score: 87.5
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail when overall_score is missing', async () => {
            const testDto = plainToInstance(UpdateOverallScoreDto, {});
            const errors = await validate(testDto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('overall_score');
            expect(errors[0].constraints).toHaveProperty('isNumber');
        });

        it('should fail when overall_score is below minimum (0)', async () => {
            const testDto = plainToInstance(UpdateOverallScoreDto, {
                overall_score: -1
            });
            const errors = await validate(testDto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('overall_score');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail when overall_score is above maximum (100)', async () => {
            const testDto = plainToInstance(UpdateOverallScoreDto, {
                overall_score: 101
            });
            const errors = await validate(testDto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('overall_score');
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should fail when overall_score is not a number', async () => {
            const invalidValues = ['87.5', 'not a number', true, {}, []];

            for (const invalidValue of invalidValues) {
                const testDto = plainToInstance(UpdateOverallScoreDto, {
                    overall_score: invalidValue
                });
                const errors = await validate(testDto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('overall_score');
                expect(errors[0].constraints).toHaveProperty('isNumber');
            }
        });

        it('should fail when overall_score is NaN or Infinity', async () => {
            const invalidValues = [NaN, Infinity, -Infinity];

            for (const invalidValue of invalidValues) {
                const testDto = plainToInstance(UpdateOverallScoreDto, {
                    overall_score: invalidValue
                });
                const errors = await validate(testDto);

                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0].property).toBe('overall_score');
            }
        });
    });

    describe('type checking', () => {
        it('should have correct types for properties', () => {
            const testDto = new UpdateOverallScoreDto();
            testDto.overall_score = 87.5;

            expect(typeof testDto.overall_score).toBe('number');
        });
    });

    describe('edge cases', () => {
        it('should accept boundary values', async () => {
            const boundaryValues = [0, 100];

            for (const value of boundaryValues) {
                const testDto = plainToInstance(UpdateOverallScoreDto, {
                    overall_score: value
                });
                const errors = await validate(testDto);
                expect(errors).toHaveLength(0);
            }
        });

        it('should accept scores with many decimal places', async () => {
            const testDto = plainToInstance(UpdateOverallScoreDto, {
                overall_score: 87.54321
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should handle floating point precision', async () => {
            const testDto = plainToInstance(UpdateOverallScoreDto, {
                overall_score: 0.1 + 0.2 // JavaScript floating point precision test
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });
    });
});
