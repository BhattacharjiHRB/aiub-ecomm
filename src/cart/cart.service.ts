// cart/cart.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, CartItem } from 'src/db/entities/cart.entity';
import { Products } from 'src/db/entities/product.entity';
import { User } from 'src/db/entities/user.entity';

import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
  ) {}

  async addToCart(dto: AddToCartDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartRepo.findOne({
      where: {
        user: { id: user.id },
      },
      relations: ['items'],
    });

    if (!cart) {
      cart = this.cartRepo.create({
        user,
        items: [],
      });

      await this.cartRepo.save(cart);
    }

    const cartItem = this.cartItemRepo.create({
      cart,
      product,
      quantity: dto.quantity,
    });

    return await this.cartItemRepo.save(cartItem);
  }

  async getCart(userId: number) {
    return await this.cartRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['items', 'items.product'],
    });
  }

  async removeItem(itemId: number) {
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return await this.cartItemRepo.remove(item);
  }
}
