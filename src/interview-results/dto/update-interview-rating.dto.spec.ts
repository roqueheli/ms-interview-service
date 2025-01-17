import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateInterviewRatingDto } from './update-interview-rating.dto';

describe('UpdateInterviewRatingDto', () => {
    let dto: UpdateInterviewRatingDto;

    beforeEach(() => {
        dto = new UpdateInterviewRatingDto();
    });

    it('should be defined', () => {
        expect(dto).toBeDefined();
    });

    describe('rating validation', () => {
        it('should validate when rating is a valid integer between 1 and 5', async () => {
            dto.rating = 4;
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should validate when rating is minimum allowed value (1)', async () => {
            dto.rating = 1;
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should validate when rating is maximum allowed value (5)', async () => {
            dto.rating = 5;
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail when rating is less than minimum (1)', async () => {
            dto.rating = 0;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('min');
        });

        it('should fail when rating is greater than maximum (5)', async () => {
            dto.rating = 6;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('max');
        });

        it('should fail when rating is not an integer', async () => {
            dto.rating = 3.5;
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('isInt');
        });

        it('should fail when rating is missing', async () => {
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
        });

        it('should fail when rating is not a number', async () => {
            (dto as any).rating = 'invalid';
            const errors = await validate(dto);
            const ratingErrors = errors.filter(error => error.property === 'rating');
            expect(ratingErrors).toHaveLength(1);
            expect(ratingErrors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO with integer rating', async () => {
            const validDto = plainToInstance(UpdateInterviewRatingDto, {
                rating: 4
            });

            const errors = await validate(validDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with multiple validation errors for invalid rating', async () => {
            const invalidDto = plainToInstance(UpdateInterviewRatingDto, {
                rating: 10.5 // Invalid: not an integer and greater than maximum
            });

            const errors = await validate(invalidDto);
            expect(errors).toHaveLength(1);
            expect(Object.keys(errors[0].constraints || {})).toEqual(
                expect.arrayContaining(['isInt', 'max'])
            );
        });

        it('should transform string numbers to integers before validation', async () => {
            const dto = plainToInstance(UpdateInterviewRatingDto, {
                rating: '4'
            });

            // La transformación debería convertir el string '4' a number 4
            expect(typeof dto.rating).toBe('number');

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with non-numeric string values', async () => {
            const dto = plainToInstance(UpdateInterviewRatingDto, {
                rating: 'invalid'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });

    describe('edge cases', () => {
        it('should fail with null rating', async () => {
            const dto = plainToInstance(UpdateInterviewRatingDto, {
                rating: null
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
        });

        it('should fail with undefined rating', async () => {
            const dto = plainToInstance(UpdateInterviewRatingDto, {
                rating: undefined
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
        });

        it('should fail with boolean rating', async () => {
            const dto = plainToInstance(UpdateInterviewRatingDto, {
                rating: true
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should fail with object rating', async () => {
            const dto = plainToInstance(UpdateInterviewRatingDto, {
                rating: {}
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isInt');
        });
    });
});
