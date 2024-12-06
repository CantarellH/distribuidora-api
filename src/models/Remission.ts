import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Client } from "./Client";
import { RemissionDetail } from "./RemissionDetail";
import { Payment } from "./Payment";

@Entity()
export class Remission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: Date;

  @ManyToOne(() => Client, (client) => client.remissions, { eager: true })
  client!: Client;

  @ManyToOne(() => Payment, (payment) => payment.remissions, { nullable: true })
  payment!: Payment | null; // Relación opcional con pagos

  @OneToMany(() => RemissionDetail, (detail) => detail.remission, {
    cascade: true,
  })
  details!: RemissionDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
