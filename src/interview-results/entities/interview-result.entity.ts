import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('interview_results')
export class InterviewResult {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    result_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @Column('uuid')
    interview_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @Column('uuid')
    question_id: string;

    @ApiProperty({ example: 'Dependency injection is a software design pattern...' })
    @Column('text', { nullable: true })
    candidate_answer: string;

    @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
    @Column('integer')
    rating: number;

    @ApiProperty({ example: 'Good understanding of the concept, but could improve...' })
    @Column('text', { nullable: true })
    ai_feedback: string;

    @ApiProperty({ example: '2024-01-16T12:00:00Z' })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}