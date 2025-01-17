import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateOverallScoreDto {
    @ApiProperty({
        example: 87.5,
        description: 'Overall score for the interview',
        minimum: 0,
        maximum: 100
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    overall_score: number;
}
