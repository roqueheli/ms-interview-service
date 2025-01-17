import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateInterviewFeedbackDto {
    @ApiProperty({
        example: 'The candidate showed good understanding of core concepts but could improve on system design patterns.',
        description: 'AI-generated feedback for the interview result',
        maxLength: 1000
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    ai_feedback: string;
}