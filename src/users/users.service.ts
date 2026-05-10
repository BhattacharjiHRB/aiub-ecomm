import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, userRole } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(userDto: CreateUserDto) {
    try {
      const { email, password, name } = userDto;

      const existingUser = await this.userRepo.findOne({
        where: { email: userDto.email },
      });

      if (existingUser) {
        return {
          message: `${email} Already Registered`,
          status: HttpStatus.CONFLICT,
        };
      }

      const hash = await bcrypt.hash(password, 12);

      const userData = this.userRepo.create({
        ...userDto,
        password: hash,
      });

      const newUser = await this.userRepo.save(userData);

      return {
        message: `Merchant ${name} created successfully!`,
        status: HttpStatus.CREATED,
        data: newUser,
      };
    } catch (err: any) {
      console.error('Create error:', err);
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async findAllUser() {
    try {
      const users = await this.userRepo.find({
        order: { createdAt: 'DESC' },
      });

      if (users.length === 0) {
        return {
          message: 'No users found',
          data: { count: 0, users: [] },
          status: HttpStatus.NO_CONTENT,
        };
      }

      const customerCount = await this.userRepo.count({
        where: { role: userRole.CUSTOMER },
      });

      return {
        message: 'Users retrieved successfully',
        data: {
          count: customerCount,
          total: users.length,
          users,
        },
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      console.error('findAllUser error:', err);
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllMerchants() {
    try {
      const merchants = await this.userRepo.find({
        where: {
          role: userRole.MERCHANT,
          isActive: true,
        },
      });

      const count = await this.userRepo.count({
        where: {
          role: userRole.MERCHANT,
          isActive: true,
        },
      });

      if (count === 0 && merchants.length === 0) {
        return {
          message: 'No active merchants found',
          data: [0, []],
        };
      }

      return {
        message: 'Merchants retrieved successfully',
        data: [count, merchants],
        status: HttpStatus.OK,
      };
    } catch (err) {
      return {
        message: 'something went wrong',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async allInactiveMerchants() {
    try {
      const [merchants, count] = await this.userRepo.findAndCount({
        where: {
          role: userRole.MERCHANT,
          isActive: false,
        },
      });

      return {
        message: 'Inactive Merchants Retrieved Successfully',
        data: {
          count,
          merchants,
        },
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  findOne(id: number) {
    try {
      const user = this.userRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!user) {
        return {
          message: `User with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        };
      }

      return {
        message: `User with id ${id} retrieved successfully`,
        data: user,
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
      });

      if (!user) {
        return {
          message: `User with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        };
      }

      const updatedUser = this.userRepo.merge(user, updateUserDto);
      const savedUser = await this.userRepo.save(updatedUser);

      const { password, ...safeUser } = savedUser;

      return {
        message: `User ${safeUser.username} updated successfully`,
        data: safeUser,
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!user) {
        return {
          message: `User with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        };
      }

      await this.userRepo.delete(id);

      return {
        message: `User with id ${id} deleted successfully`,
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async getAllMerchants() {
    try {
      const merchants = await this.userRepo.find({
        where: {
          role: userRole.MERCHANT,
        },
      });

      if (merchants.length === 0) {
        return {
          message: 'No merchants found',
          data: [0, []],
          status: HttpStatus.NO_CONTENT,
        };
      }

      return {
        message: 'Merchants retrieved successfully',
        data: [merchants.length, merchants],
        status: HttpStatus.OK,
      };
    } catch (error) {
      return {
        message: 'Failed to retrieve merchants',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async merchantAprrove(id: number, isActive: boolean) {
    try {
      const merchant = await this.userRepo.findOne({
        where: {
          id,
          role: userRole.MERCHANT,
        },
      });

      if (!merchant) {
        return {
          message: `Merchant with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        };
      }

      merchant.isActive = isActive;
      await this.userRepo.save(merchant);

      return {
        message: `Merchant with id ${id} has been ${isActive ? 'approved' : 'disapproved'}`,
        status: HttpStatus.OK,
      };
    } catch (error) {}
  }

  async admin(userDto: CreateUserDto) {
    try {
      const adminExists = await this.userRepo.findOne({
        where: {
          email: 'admin@aiub.ecomm',
        },
      });

      if (adminExists) {
        return {
          message: 'Admin already exists',
          status: HttpStatus.CONFLICT,
        };
      }

      const hash = await bcrypt.hash('admin123', 12);

      const adminData = this.userRepo.create({
        name: 'Admin AIUB Ecomm',
        email: 'admin@aiub.ecomm',
        username: 'adminComm',
        password: hash,
        address: userDto.address,
        phoneNumber: userDto.phoneNumber,
        role: userRole.ADMIN,
      });

      const newAdmin = await this.userRepo.save(adminData);

      return {
        message: 'Admin created successfully',
        status: HttpStatus.CREATED,
        data: newAdmin,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
