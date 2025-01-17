import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateInterviewConfigDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    enterprise_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @IsUUID()
    job_role_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
    @IsUUID()
    seniority_id: string;

    @ApiProperty({ example: 60, description: 'Duration in minutes' })
    @IsInt()
    @Min(1)
    duration_minutes: number;

    @ApiProperty({ example: 10, description: 'Number of questions' })
    @IsInt()
    @Min(1)
    num_questions: number;

    @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    complexity_level: number;

    @ApiProperty({ example: 24, description: 'Validity period in hours' })
    @IsInt()
    @Min(1)
    validity_hours: number;
}