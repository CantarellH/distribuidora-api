import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Client } from "./Client"; // Asegúrate de tener definido el modelo Client adecuadamente.
import { RemissionDetail } from "./RemissionDetail";
import { PaymentDetail } from "./PaymentDetail";

@Entity("remissions")
export class Remission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, (client) => client.remissions)
  client!: Client;

  @OneToMany(() => RemissionDetail, (detail) => detail.remission, {
    cascade: true,
  })
  details!: RemissionDetail[];

  @Column({ type: "date" })
  date!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  weightTotal!: number;

  @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 2,
        comment: "Precio por kilo al momento de la remisión" 
    })
    pricePerKilo!: number;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true,
        comment: "Clave SAT del producto al momento de la remisión"
    })
    claveSatSnapshot?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalCost!: number;

  @Column({ type: "boolean", default: false })
  isPaid!: boolean; // Indica si la remisión está completamente pagada

  @Column({ nullable: true })
  cfdiFolio?: string; // Folio fiscal del CFDI

  @Column({ type: "timestamp", nullable: true })
  fechaFacturacion?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => PaymentDetail, (paymentDetail) => paymentDetail.remission, {
    cascade: true,
  })
  paymentDetails!: PaymentDetail[];
  @Column({ default: false })
  shouldBeInvoiced!: boolean;

  getImporte(): number {
        return this.weightTotal * this.pricePerKilo;
    }
}
