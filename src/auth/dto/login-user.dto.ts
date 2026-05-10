import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class LoginUserDto {
  @IsString()
  email!: string;
  @IsString()
  password!: string;

  
}
