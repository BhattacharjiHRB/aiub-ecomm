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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import { userRole } from 'src/db/entities/user.entity';
import { RoleBasedAuthGuard } from 'src/helper/auth-guard';
import { JwtGuard } from 'src/helper/jwt-guard';
import { multerConfig } from 'src/helper/multer.config';
import { Roles } from 'src/helper/Roles';

import { CreateProductDto } from './dto/create-product.dto';

import {
  PartialUpdateProductDto,
  UpdateProductDto,
} from './dto/update-product.dto';

import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // CREATE PRODUCT

  @UseGuards(JwtGuard, RoleBasedAuthGuard)
  @Roles(userRole.MERCHANT)

  @Post()

  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  )

  create(
    @UploadedFiles() files: Express.Multer.File[],

    @Body() dto: CreateProductDto,
  ) {
    const imageUrls = files.map(
      (file) =>
        `/uploads/products/${file.filename}`,
    );

    dto.imageUrl = imageUrls;

    return this.productsService.create(dto);
  }

  // GET ALL PRODUCTS 

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // SEARCH PRODUCT 

  @Get('search/:keyword')

  search(@Param('keyword') keyword: string) {
    return this.productsService.search(keyword);
  }

  //  GET SINGLE PRODUCT

  @Get(':id')

  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // PATCH PRODUCT 

  @UseGuards(JwtGuard, RoleBasedAuthGuard)

  @Roles(userRole.MERCHANT)

  @Patch(':id')

  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  )

  update(
    @Param('id') id: number,

    @UploadedFiles() files: Express.Multer.File[],

    @Body() dto: PartialUpdateProductDto,
  ) {
    if (files?.length) {
      dto.imageUrl = files.map(
        (file) =>
          `/uploads/products/${file.filename}`,
      );
    }

    return this.productsService.update(+id, dto);
  }

  // REPLACE PRODUCT

  @UseGuards(JwtGuard, RoleBasedAuthGuard)

  @Roles(userRole.MERCHANT)

  @Put(':id')

  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
  )

  replace(
    @Param('id') id: number,

    @UploadedFiles() files: Express.Multer.File[],

    @Body() dto: UpdateProductDto,
  ) {
    if (files?.length) {
      dto.imageUrl = files.map(
        (file) =>
          `/uploads/products/${file.filename}`,
      );
    }

    return this.productsService.replace(+id, dto);
  }

  // DELETE PRODUCT 

  @UseGuards(JwtGuard, RoleBasedAuthGuard)

  @Roles(
    userRole.MERCHANT,
    userRole.ADMIN,
  )

  @Delete(':id')

  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}

