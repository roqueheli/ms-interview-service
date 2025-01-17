import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';
import { UpdateRecommendationsDto } from './update-recommendations.dto';

describe('UpdateRecommendationsDto', () => {
    let dto: UpdateRecommendationsDto;

    beforeEach(() => {
        dto = new UpdateRecommendationsDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('recommendations validation', () => {
        it('should accept a valid recommendations string', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Consider focusing on system design concepts and improving communication skills'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail when recommendations is missing', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {});
            const errors = await validate(testDto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('recommendations');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when recommendations is an empty string', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: ''
            });
            const errors = await validate(testDto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('recommendations');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when recommendations exceeds 1000 characters', async () => {
            const recommendations = 'a'.repeat(1001);
            const testDto = plainToInstance(UpdateRecommendationsDto, { recommendations });
            const errors = await validate(testDto);

            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('recommendations');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should fail when recommendations is not a string', async () => {
            const invalidValues = [123, true, {}, [], null, undefined];

            for (const invalidValue of invalidValues) {
                const testDto = plainToInstance(UpdateRecommendationsDto, {
                    recommendations: invalidValue
                });
                const errors = await validate(testDto);

                expect(errors).toHaveLength(1);
                expect(errors[0].property).toBe('recommendations');
                expect(errors[0].constraints).toHaveProperty('isString');
            }
        });
    });

    describe('content validation', () => {
        it('should accept recommendations with special characters', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should accept recommendations with multiple lines', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Line 1\nLine 2\nLine 3'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should accept recommendations with emojis', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Great work! 👍 Keep improving! 🚀'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should accept recommendations with unicode characters', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Recomendación en español: ñ á é í ó ú'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('edge cases', () => {
        it('should handle strings with leading/trailing spaces', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: '  Valid recommendations with spaces  '
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should handle strings with multiple consecutive spaces', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Valid    recommendations    with    multiple    spaces'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });

        it('should handle strings with tab characters', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: 'Valid\trecommendations\twith\ttabs'
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('type checking', () => {
        it('should have correct types for properties', () => {
            const testDto = new UpdateRecommendationsDto();
            testDto.recommendations = 'Test recommendations';

            expect(typeof testDto.recommendations).toBe('string');
        });
    });

    describe('real-world scenarios', () => {
        it('should accept a typical recommendations text', async () => {
            const testDto = plainToInstance(UpdateRecommendationsDto, {
                recommendations: `
          The candidate showed strong problem-solving skills but could benefit from:
          1. Deeper understanding of system design principles
          2. More practice with algorithm optimization
          3. Improved communication of technical concepts
          
          Recommended areas for improvement:
          - Study distributed systems architecture
          - Practice explaining complex solutions
          - Review time complexity analysis
        `.trim()
            });
            const errors = await validate(testDto);
            expect(errors).toHaveLength(0);
        });
    });
});
