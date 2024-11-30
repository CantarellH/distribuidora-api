import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Client } from "./Client";

@Entity("remissions")
export class Remission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "client_id" })
  client!: Client;

  @Column({ name: "note", type: "text", nullable: true })
  note?: string;

  @Column({ name: "total_boxes", type: "int", default: 0 })
  totalBoxes!: number;

  @Column({
    name: "total_net_weight",
    type: "numeric",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalNetWeight!: number;

  @Column({
    name: "total_amount",
    type: "numeric",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount!: number;

  @Column({ name: "status", type: "varchar", length: 20, default: "Pendiente" })
  status!: string;

  @CreateDateColumn({ name: "remission_date" })
  remissionDate!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
