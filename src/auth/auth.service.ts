import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, userRole } from 'src/db/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async register(userDto: CreateUserDto) {
    const { email, password, name, username, address, phoneNumber } = userDto;

    try {
      const existingUser = await this.userRepo.findOne({
        where: { email },
      });

      if (existingUser) {
        return {
          message: `${email} Already Registered`,
          status: HttpStatus.CONFLICT,
        };
      }

      const role = userDto.role || userRole.CUSTOMER;

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = this.userRepo.create({
        email,
        name,
        username,
        address,
        phoneNumber,
        password: hashedPassword,
        role: role,
      });

      const savedUser = await this.userRepo.save(newUser);

      return {
        message: `User ${name} created successfully as ${role}!`,
        status: HttpStatus.CREATED,
        data: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          username: savedUser.username,
          role: savedUser.role,
        },
      };
    } catch (err: any) {
      console.error('Registration error:', err);
      return {
        message: err.message || 'Registration failed',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;

    try {
      const checkUser = await this.userRepo.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'name', 'username', 'role'],
      });

      if (!checkUser) {
        return {
          message: "User Doesn't Exist",
          status: HttpStatus.NOT_FOUND,
        };
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        checkUser.password,
      );

      if (!isPasswordValid) {
        return {
          message: 'Invalid Credentials',
          status: HttpStatus.UNAUTHORIZED,
        };
      }

      const payload = {
        id: checkUser.id,
        name: checkUser.name,
        email: checkUser.email,
        role: checkUser.role,
      };

      const token = await this.jwt.signAsync(payload);

      return {
        message: 'Login Successful!',
        status: HttpStatus.OK,
        data: token,
      };
    } catch (err) {
      console.error('Login error:', err);
      throw new HttpException('Error Logging In', HttpStatus.BAD_REQUEST);
    }
  }

  async forgetPassword(email: string) {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        return {
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      const resetToken = await this.jwt.signAsync(
        { id: user.id, email: user.email },
        { expiresIn: '1h' },
      );

      return {
        message: 'Reset token generated',
        status: HttpStatus.OK,
        data: resetToken,
      };
    } catch (err) {
      console.error('Forget password error:', err);
      return {
        message: 'Error generating reset token',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    try {
      if (newPassword !== confirmPassword) {
        return {
          message: 'Passwords do not match',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const payload = await this.jwt.verifyAsync(token);
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      if (!user) {
        return {
          message: 'User not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await this.userRepo.save(user);

      return {
        message: 'Password reset successful',
        status: HttpStatus.OK,
      };
    } catch (err) {
      console.error('Reset password error:', err);
      return {
        message: 'Invalid or expired token',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
