import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty()
  @IsInt()
  readonly branch: number;

  @ApiProperty()
  @IsString()
  readonly lang: string;
}
