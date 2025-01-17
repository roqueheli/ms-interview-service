import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { InterviewStatus } from '../entities/interview.entity';
import { CreateInterviewDto } from './create-interview.dto';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
    @ApiProperty({ enum: InterviewStatus, required: false })
    @IsEnum(InterviewStatus)
    @IsOptional()
    status?: InterviewStatus;
}