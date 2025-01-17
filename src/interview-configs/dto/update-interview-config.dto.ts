import { PartialType } from '@nestjs/swagger';
import { CreateInterviewConfigDto } from './create-interview-config.dto';

export class UpdateInterviewConfigDto extends PartialType(CreateInterviewConfigDto) { }