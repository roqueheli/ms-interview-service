import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('interview_configs')
export class InterviewConfig {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    config_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @Column('uuid')
    enterprise_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @Column('uuid')
    job_role_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
    @Column('uuid')
    seniority_id: string;

    @ApiProperty({ example: 60, description: 'Duration in minutes' })
    @Column('integer')
    duration_minutes: number;

    @ApiProperty({ example: 10, description: 'Number of questions' })
    @Column('integer')
    num_questions: number;

    @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
    @Column('integer')
    complexity_level: number;

    @ApiProperty({ example: 24, description: 'Validity period in hours' })
    @Column('integer')
    validity_hours: number;

    @ApiProperty({ example: '2024-01-16T12:00:00Z' })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}