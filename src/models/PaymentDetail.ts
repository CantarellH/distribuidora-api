import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Payment } from "./Payment";
import { Remission } from "./Remission";

@Entity("payment_details")
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Payment, payment => payment.paymentDetails, { onDelete: "CASCADE" })
  payment!: Payment;

  @ManyToOne(() => Remission, remission => remission.paymentDetails, { onDelete: "CASCADE" })
  remission!: Remission;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amountAssigned!: number; // Monto asignado de este pago a la remisión
}
