import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { InterviewStatus } from '../entities/interview.entity';

export class CreateInterviewDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsUUID()
    application_id: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
    @IsUUID()
    config_id: string;

    @ApiProperty({ enum: InterviewStatus, default: InterviewStatus.PENDING })
    @IsEnum(InterviewStatus)
    @IsOptional()
    status?: InterviewStatus;

    @ApiProperty({ example: '2024-01-16T12:00:00Z', required: false })
    @IsDateString()
    @IsOptional()
    scheduled_date?: Date;

    @ApiProperty({ example: '2024-01-17T12:00:00Z' })
    @IsDateString()
    expiration_date: Date;

    @ApiProperty({ example: 'https://example.com/video.mp4', required: false })
    @IsUrl()
    @IsOptional()
    video_recording_url?: string;
}