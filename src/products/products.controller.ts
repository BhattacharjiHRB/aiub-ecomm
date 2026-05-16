// products.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  PartialUpdateProductDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { multerConfig } from 'src/helper/multer.config';



@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  )
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
  ) {
    const imageUrls = files.map(
      (file) => `/uploads/${file.filename}`,
    );

    dto.imageUrl = imageUrls;

    return this.productsService.create(dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: PartialUpdateProductDto,
  ) {
    if (files?.length) {
      dto.imageUrl = files.map(
        (file) => `/uploads/${file.filename}`,
      );
    }

    return this.productsService.update(+id, dto);
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  )
  replace(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateProductDto,
  ) {
    if (files?.length) {
      dto.imageUrl = files.map(
        (file) => `/uploads/${file.filename}`,
      );
    }

    return this.productsService.replace(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}