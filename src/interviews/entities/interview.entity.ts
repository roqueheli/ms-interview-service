import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum InterviewStatus {
    PENDING = 'pending',
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Entity('interviews')
export class Interview {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    interview_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @Column('uuid')
    application_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @Column('uuid')
    config_id: string;

    @ApiProperty({ enum: InterviewStatus, default: InterviewStatus.PENDING })
    @Column({
        type: 'enum',
        enum: InterviewStatus,
        default: InterviewStatus.PENDING
    })
    status: InterviewStatus;

    @ApiProperty({ example: '2024-01-16T12:00:00Z', nullable: true })
    @Column({ type: 'timestamp with time zone', nullable: true })
    scheduled_date: Date;

    @ApiProperty({ example: '2024-01-17T12:00:00Z' })
    @Column({ type: 'timestamp with time zone' })
    expiration_date: Date;

    @ApiProperty({ example: 'https://example.com/video.mp4', nullable: true })
    @Column({ length: 255, nullable: true })
    video_recording_url: string;

    @ApiProperty({ example: '2024-01-16T12:00:00Z' })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}