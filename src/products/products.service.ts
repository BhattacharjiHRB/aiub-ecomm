import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from 'src/db/entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import {
  PartialUpdateProductDto,
  UpdateProductDto,
} from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productsRepo: Repository<Products>,
  ) {}

  async create(dto: CreateProductDto) {
    try {
      const product = this.productsRepo.create(dto);
      await this.productsRepo.save(product);

      return {
        message: 'Product created',
        data: product,
        status: HttpStatus.CREATED,
      };
    } catch (err: any) {
      return {
        message: 'Error creating product',
        error: err.message,
      };
    }
  }
  async findAll() {
    try {
      const products = await this.productsRepo.find({
        order: { createdAt: 'DESC' },
      });

      return {
        message: 'All products fetched',
        count: products.length,
        data: products,
      };
    } catch (err: any) {
      return {
        message: 'Error fetching products',
        error: err.message,
        status: HttpStatus.BAD_GATEWAY,
      };
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productsRepo.findOne({ where: { id } });

      if (!product) {
        return {
          message: `Product with id ${id} not found`,
          status: HttpStatus.NOT_FOUND,
        };
      }

      return { message: 'Product fetched', data: product };
    } catch (err: any) {
      return {
        message: 'Error fetching product',
        error: err.message,
        status: HttpStatus.BAD_GATEWAY,
      };
    }
  }

  async update(id: number, dto: PartialUpdateProductDto) {
    try {
      await this.findOne(id);

      await this.productsRepo.update(id, dto);
      const updated = await this.productsRepo.findOne({ where: { id } });

      return { message: 'Product updated', data: updated };
    } catch (err: any) {
      return {
        message: 'Error updating product',
        error: err.message,
      };
    }
  }

  async replace(id: number, dto: UpdateProductDto) {
    try {
      const product = await this.findOne(id);

      const updated = { ...product.data, ...dto, id };
      await this.productsRepo.save(updated);

      return {
        message: 'Product replaced',
        data: updated,
        status: HttpStatus.OK,
      };
    } catch (err: any) {
      return {
        message: 'Error replacing product',
        error: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    await this.productsRepo.delete(id);

    return { message: 'Product deleted', data: product.data?.id };
  }

  async findByCategory(category: string) {
    try {
      const products = await this.productsRepo.find({
        where: { category },
      });

      return {
        message: `Products in category ${category}`,
        status: HttpStatus.OK,
        count: products.length,
        data: products,
      };
    } catch (err: any) {
      return {
        message: 'Error fetching products by category',
        error: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async search(keyword: string) {
    try {
      const products = await this.productsRepo.find({
        where: { name: ILike(`%${keyword}%`) },
      });

      return {
        message: `Search results for ${keyword}`,
        count: products.length,
        data: products,
      };
    } catch (err: any) {
      return {
        message: 'Error searching products',
        error: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async toggleActive(id: number) {
    try {
      const product = await this.productsRepo.findOne({ where: { id } });

      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`);

      product.isActive = !product.isActive;
      await this.productsRepo.save(product);

      return { message: 'Product status toggled', data: product };
    } catch (err: any) {
      return {
        message: 'Error toggling product status',
        error: err.message,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
