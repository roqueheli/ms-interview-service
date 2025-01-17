import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    job_role_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @IsUUID()
    seniority_id: string;

    @ApiProperty({ example: 'What is dependency injection?' })
    @IsString()
    question_text: string;

    @ApiProperty({ example: 'Dependency injection is a design pattern...', required: false })
    @IsString()
    @IsOptional()
    expected_answer?: string;

    @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    complexity_level: number;
}