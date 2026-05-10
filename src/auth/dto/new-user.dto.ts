import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class NewUserDTO extends OmitType(CreateUserDto, [
  'password',
] as const) {}
