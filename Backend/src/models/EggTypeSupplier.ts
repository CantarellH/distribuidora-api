import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Column,
} from "typeorm";
import { EggType } from "./EggType";
import { Supplier } from "./Supplier";

@Entity("egg_type_suppliers")
export class EggTypeSupplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EggType, (eggType) => eggType.eggTypeSuppliers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "egg_type_id" })
  eggType!: EggType;

  @ManyToOne(() => Supplier, (supplier) => supplier.eggTypeSuppliers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "supplier_id" })
  supplier!: Supplier;

  @Column({
    type: "boolean",
    default: true,
    comment: "Indica si el proveedor está activo para este tipo de huevo",
  })
  isActive!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
