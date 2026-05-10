import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { userRole } from 'src/db/entities/user.entity';
import { RoleBasedAuthGuard } from 'src/helper/auth-guard';
import { JwtGuard } from 'src/helper/jwt-guard';
import { Roles } from 'src/helper/Roles';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RoleBasedAuthGuard)
  @Roles(userRole.ADMIN)
  @Post('merchants')
  async createMerchants(@Body() userDto: CreateUserDto) {
    return this.usersService.create(userDto);
  }

  @UseGuards(RoleBasedAuthGuard)
  @Roles(userRole.ADMIN)
  @Get('merchants/active')
  allMerchants() {
    return this.usersService.findAllMerchants();
  }

  @UseGuards(RoleBasedAuthGuard)
  @Roles(userRole.ADMIN)
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

  @UseGuards(RoleBasedAuthGuard)
  @Roles(userRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(RoleBasedAuthGuard, JwtGuard)
  @Roles(userRole.ADMIN)
  @Get('merchants/inactive')
  findInactiveMerchants() {
    return this.usersService.allInactiveMerchants();
  }

  @UseGuards(RoleBasedAuthGuard)
  @Roles(userRole.ADMIN)
  @Get('merchants/all')
  getAllMerchants() {
    return this.usersService.getAllMerchants();
  }

  @UseGuards(RoleBasedAuthGuard)
  @Roles(userRole.ADMIN)
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
