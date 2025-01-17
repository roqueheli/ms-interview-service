import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateRecommendationsDto {
    @ApiProperty({
        example: 'Consider focusing on system design concepts and improving communication skills',
        description: 'Recommendations for the candidate',
        maxLength: 1000
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    recommendations: string;
}