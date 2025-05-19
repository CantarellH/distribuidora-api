import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ nullable: true })
  sku?: string;

  @Column({
    type: "varchar",
    length: 10,
    comment: "Clave del producto según catálogo del SAT",
  })
  claveSat!: string;

  @Column({
    type: "varchar",
    length: 20,
    comment: "Unidad de medida según SAT (PIEZA, KILOGRAMO, etc)",
  })
  unidadSat!: string;

  @Column({
    type: "varchar",
    length: 10,
    comment: "Clave de unidad de medida según catálogo SAT",
  })
  claveUnidadSat!: string;

  @Column({
    type: "int",
    default: 0,
    comment: "Inventario actual en número de cajas",
  })
  currentStock!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @OneToMany(
    () => EggTypeSupplier,
    (eggTypeSupplier: EggTypeSupplier) => eggTypeSupplier.eggType
  )
  eggTypeSuppliers!: EggTypeSupplier[];

  @OneToMany(
    () => RemissionDetail,
    (remissionDetail: RemissionDetail) => remissionDetail.eggType
  )
  remissionDetails!: RemissionDetail[];

  @OneToMany(
    () => InventoryMovement,
    (movement: InventoryMovement) => movement.eggType
  )
  movements!: InventoryMovement[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
