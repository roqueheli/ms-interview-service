import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('questions')
export class Question {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    question_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @Column('uuid')
    job_role_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @Column('uuid')
    seniority_id: string;

    @ApiProperty({ example: 'What is dependency injection?' })
    @Column('text')
    question_text: string;

    @ApiProperty({ example: 'Dependency injection is a design pattern...', nullable: true })
    @Column('text', { nullable: true })
    expected_answer: string;

    @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
    @Column('integer')
    complexity_level: number;

    @ApiProperty({ example: '2024-01-16T12:00:00Z' })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}