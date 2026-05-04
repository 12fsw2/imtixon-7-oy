import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'superadmin@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SuperAdmin@123' })
  @IsString()
  @MinLength(6)
  password: string;
}
