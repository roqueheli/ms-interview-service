import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateInterviewReportDto } from './create-interview-report.dto';

export class UpdateInterviewReportDto extends PartialType(CreateInterviewReportDto) {
    @ApiProperty({ example: 87.5, required: false })
    @IsNumber()
    @IsOptional()
    overall_score?: number;
}