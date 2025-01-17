import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('interview_reports')
export class InterviewReport {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    report_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @Column('uuid')
    interview_id: string;

    @ApiProperty({
        example: {
            technical_score: 85,
            communication_score: 90,
            detailed_feedback: {}
        }
    })
    @Column('jsonb', { nullable: true })
    company_report: Record<string, any>;

    @ApiProperty({
        example: {
            overall_performance: 'Excellent',
            areas_of_improvement: []
        }
    })
    @Column('jsonb', { nullable: true })
    candidate_report: Record<string, any>;

    @ApiProperty({ example: 87.5 })
    @Column('decimal', { precision: 5, scale: 2 })
    overall_score: number;

    @ApiProperty({ example: 'Consider focusing on system design concepts' })
    @Column('text', { nullable: true })
    recommendations: string;

    @ApiProperty({ example: '2024-01-16T12:00:00Z' })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}