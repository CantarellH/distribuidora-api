import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Remission } from "./Remission";
import { EggType } from "./EggType";
import { Supplier } from "./Supplier";

@Entity("remission_details")
export class RemissionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Remission, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "remission_id" })
  remission!: Remission;

  @ManyToOne(() => EggType, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "egg_type_id" })
  eggType!: EggType;

  @ManyToOne(() => Supplier, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "supplier_id" })
  supplier!: Supplier;

  @Column({ name: "weight_type", type: "int" })
  weightType!: number;

  @Column({ name: "box_count", type: "int" })
  boxCount!: number;

  @Column({ name: "weight_total", type: "numeric", precision: 10, scale: 2 })
  weightTotal!: number;

  @Column({ name: "tara_total", type: "numeric", precision: 10, scale: 2 })
  taraTotal!: number;

  @Column({ name: "net_weight", type: "numeric", precision: 10, scale: 2 })
  netWeight!: number;

  @Column({ name: "price_per_kg", type: "numeric", precision: 10, scale: 2 })
  pricePerKg!: number;

  @Column({ name: "subtotal", type: "numeric", precision: 10, scale: 2 })
  subtotal!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
