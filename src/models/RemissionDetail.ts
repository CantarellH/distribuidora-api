import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Remission } from "./Remission";
import { EggType } from "./EggType";
import { Supplier } from "./Supplier";

@Entity("remission_detail")
export class RemissionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Remission, (remission) => remission.details, {
    onDelete: "CASCADE",
  })
  remission!: Remission;

  @ManyToOne(() => EggType, (eggType) => eggType.remissionDetails, {
    eager: true,
  })
  eggType!: EggType;

  @ManyToOne(() => Supplier, (supplier) => supplier.remissionDetails, {
    eager: true,
  })
  supplier!: Supplier;

  @Column({ type: "int" })
  boxCount!: number;

  @Column({ type: "double precision" })
  weightTotal!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
