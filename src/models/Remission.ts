import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn
} from "typeorm";
import { Client } from "./Client"; // Asegúrate de tener definido el modelo Client adecuadamente.
import { RemissionDetail } from "./RemissionDetail";
import { PaymentDetail } from "./PaymentDetail";

@Entity("remissions")
export class Remission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, client => client.remissions)
  client!: Client;

  @OneToMany(() => RemissionDetail, detail => detail.remission, { cascade: true })
  details!: RemissionDetail[];

  @Column({ type: "date" })
date!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalCost!: number;

  @Column({ type: "boolean", default: false })
  isPaid!: boolean; // Indica si la remisión está completamente pagada

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => PaymentDetail, paymentDetail => paymentDetail.remission, { cascade: true })
  paymentDetails!: PaymentDetail[];
}

