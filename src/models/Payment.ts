import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Client } from "./Client";
import { Remission } from "./Remission";
import { PaymentDetail } from "./PaymentDetail";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, client => client.payments, { onDelete: "CASCADE" })
  client!: Client;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: "varchar", length: 255 })
  method!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => PaymentDetail, paymentDetail => paymentDetail.payment, { cascade: true })
  paymentDetails!: PaymentDetail[];
}

