// orders/orders.service.ts

import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from 'src/db/entities/cart.entity';
import { Order, OrderItem } from 'src/db/entities/order.entity';
import { Products } from 'src/db/entities/product.entity';
import { MailService } from 'src/mail/mail.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,

    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    private readonly mailService: MailService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    try {
      const cart = await this.cartRepo.findOne({
        where: {
          user: { id: dto.userId },
        },
        relations: ['user', 'items', 'items.product'],
      });

      if (!cart || cart.items.length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      let total = 0;

      const order = this.orderRepo.create({
        user: cart.user,
        totalPrice: 0,
      });

      const savedOrder = await this.orderRepo.save(order);

      const orderItems: OrderItem[] = [];

      for (const item of cart.items) {
        const product = item.product;
        const stock = product.stock ?? 0;

        const subtotal = Number(product.price) * item.quantity;

        total += subtotal;

        if (stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for ${product.name}`);
        }

        await this.productRepo.decrement(
          { id: product.id },
          'stock',
          item.quantity,
        );

        const orderItem = this.orderItemRepo.create({
          order: savedOrder,
          product,
          quantity: item.quantity,
          price: Number(product.price),
        });

        orderItems.push(orderItem);
      }

      if (orderItems.length > 0) {
        await this.orderItemRepo.save(orderItems);
      }

      savedOrder.totalPrice = total;
      await this.orderRepo.save(savedOrder);

      const newOrder = await this.orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: {
          items: {
            product: true,
          },
        },
      });

      return {
        message: 'Order Created Successfully',
        status: HttpStatus.OK,
        data: newOrder,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async getAllOrders() {
    try {
      const allOrders = await this.orderRepo.find({
        relations: ['user', 'items', 'items.product'],
      });
      return {
        message: 'Orders Retreived Successfully',
        status: HttpStatus.OK,
        data: allOrders,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async getOrder(id: number) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['user', 'items', 'items.product'],
      });
      return {
        message: 'Order Retrived Successfully!',
        status: HttpStatus.OK,
        data: order,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async updateOrder(id: number, dto: UpdateOrderDto) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      Object.assign(order, dto);

      const updated = await this.orderRepo.save(order);

      return {
        message: 'Order Updated Successfully!',
        status: HttpStatus.OK,
        data: updated,
      };
    } catch (err: any) {
      return {
        message: err.message,
        status: HttpStatus.BAD_GATEWAY,
      };
    }
  }

  async deleteOrder(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepo.remove(order);

    return {
      message: 'Order deleted successfully',
    };
  }
}
