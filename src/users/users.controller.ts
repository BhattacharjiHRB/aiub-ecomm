import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('merchants/register')
  async createMerchants(@Body() userDto: CreateUserDto) {
    return this.usersService.create(userDto);
  }

  @Get('merchants/active')
  allMerchants() {
    return this.usersService.findAllMerchants();
  }

  @Get('all')
  allUsers() {
    return this.usersService.findAllUser();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('merchants/inactive')
  findInactiveMerchants() {
    return this.usersService.allInactiveMerchants();
  }

  @Get('merchants/all')
  getAllMerchants() {
    return this.usersService.getAllMerchants();
  }

  @Patch('merchants/approve/:id')
  approveMerchant(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.merchantAprrove(+id, isActive);
  }

  @Post('admin')
  async createAdmin(@Body() userDto: CreateUserDto) {
    return this.usersService.admin(userDto);
  }
}
