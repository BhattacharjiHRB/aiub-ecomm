import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum userRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  public name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  public email!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  public username!: string;

  @Column({ type: 'varchar', length: 255,})
  public password!: string;

  @Column()
  public address!: string;

  @Column()
  public phoneNumber!: string;

  @Column({ type: 'enum', enum: userRole, default: userRole.CUSTOMER })
  public role!: userRole;

  @Column({ default: false })
  public isActive!: boolean;

  @Column()
  @CreateDateColumn()
  public createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt!: Date;
}
