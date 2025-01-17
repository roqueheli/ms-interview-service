import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInterviewReportDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    interview_id: string;

    @ApiProperty({
        example: {
            technical_score: 85,
            communication_score: 90,
            detailed_feedback: {}
        }
    })
    @IsObject()
    @IsOptional()
    company_report?: Record<string, any>;

    @ApiProperty({
        example: {
            overall_performance: 'Excellent',
            areas_of_improvement: []
        }
    })
    @IsObject()
    @IsOptional()
    candidate_report?: Record<string, any>;

    @ApiProperty({ example: 87.5 })
    @IsNumber()
    overall_score: number;

    @ApiProperty({ example: 'Consider focusing on system design concepts' })
    @IsString()
    @IsOptional()
    recommendations?: string;
}