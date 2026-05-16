// orders/dto/update-order.dto.ts

import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/db/entities/order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
