import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateInterviewResultDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    interview_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @IsUUID()
    question_id: string;

    @ApiProperty({ example: 'Dependency injection is a software design pattern...' })
    @IsString()
    @IsOptional()
    candidate_answer?: string;

    @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ example: 'Good understanding of the concept, but could improve...' })
    @IsString()
    @IsOptional()
    ai_feedback?: string;
}