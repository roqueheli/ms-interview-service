import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { CreateInterviewResultDto } from './create-interview-result.dto';

export class UpdateInterviewResultDto extends PartialType(CreateInterviewResultDto) {
    @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;
}