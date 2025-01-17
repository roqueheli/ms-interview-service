import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateInterviewRatingDto {
    @ApiProperty({
        example: 4,
        description: 'Rating score for the interview result',
        minimum: 1,
        maximum: 5
    })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return parseInt(value, 10);
        }
        return value;
    })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;
}