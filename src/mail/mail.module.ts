import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/db/entities/order.entity';
import { User } from 'src/db/entities/user.entity';
import { MailService } from './mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
