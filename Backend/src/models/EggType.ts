import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";
import { InventoryMovement } from "./InventoryMovement";
import { EggTypeSupplier } from "./EggTypeSupplier";

@Entity("egg_types")
export class EggType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @OneToMany(() => EggTypeSupplier, (eggTypeSupplier: EggTypeSupplier) => eggTypeSupplier.eggType)
  eggTypeSuppliers!: EggTypeSupplier[];

  @OneToMany(() => RemissionDetail, (remissionDetail: RemissionDetail) => remissionDetail.eggType)
  remissionDetails!: RemissionDetail[];

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  currentStock: number = 0;

  @OneToMany(() => InventoryMovement, (movement: InventoryMovement) => movement.eggType)
  movements!: InventoryMovement[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}