import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Remission } from "./Remission";
import { Payment } from "./Payment";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contact_info?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @OneToMany(() => Remission, (remission) => remission.client)
  remissions!: Remission[];

  @OneToMany(() => Payment, (payment) => payment.client)
  payments!: Payment[]; // Relación con los pagos

  @Column({ type: "boolean", default: true })
  status!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
