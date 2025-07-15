// src/shared/dtos/update-user.dto.ts
import { IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  isActive?: boolean;
}