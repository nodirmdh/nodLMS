import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role, UserStatusType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsString()
  fio?: string;

  @ApiProperty()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  @IsEnum(Role, { each: true })
  role?: Role[];

  @ApiProperty()
  @IsArray()
  branches?: string[];

  @ApiProperty({ required: false })
  @IsNumber()
  salary?: number;

  @ApiProperty({
    enum: UserStatusType,
    enumName: 'UserStatusType',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatusType)
  status?: UserStatusType;
}
