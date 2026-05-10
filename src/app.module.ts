import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbService } from './db/db.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';


@Module({
  controllers: [AppController],
  providers: [AppService, dbService],
  imports: [
    UsersModule,
    ProductsModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({ useClass: dbService }),
  ],
})
export class AppModule {}
