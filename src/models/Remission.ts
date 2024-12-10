import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from "typeorm";
import { Client } from "./Client";
import { RemissionDetail } from "./RemissionDetail";
import { Payment } from "./Payment";

@Entity("remissions")
export class Remission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: Date;

  @ManyToOne(() => Client, (client) => client.remissions, { eager: true })
  client!: Client;

  @OneToMany(() => RemissionDetail, (detail) => detail.remission, { cascade: true })
  details!: RemissionDetail[];

  @ManyToMany(() => Payment, (payment) => payment.remissions)
  payments!: Payment[];
 

  @Column({ type: "boolean", default: false })
  isPaid!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
