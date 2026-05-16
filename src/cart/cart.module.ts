import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/db/entities/cart.entity';
import { Products } from 'src/db/entities/product.entity';
import { User } from 'src/db/entities/user.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Products])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
