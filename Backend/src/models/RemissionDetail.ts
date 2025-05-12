import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Remission } from "./Remission";
import { BoxWeight } from "./BoxWeight";
import { EggType } from "./EggType"; // Asumimos que tienes un modelo para EggType.
import { Supplier } from "./Supplier"; // Asumimos que tienes un modelo para Supplier.

@Entity()
export class RemissionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Remission, (remission) => remission.details, {
    onDelete: "CASCADE",
  })
  remission!: Remission;

  @ManyToOne(() => EggType)
  eggType!: EggType;

  @ManyToOne(() => Supplier)
  supplier!: Supplier;

  @Column({ type: "int" })
  boxCount!: number; // Número de cajas en la salida

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  weightTotal!: number; // Peso total calculado o acumulado de las cajas

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  estimatedWeightPerBox!: number; // Peso estimado por caja (para tarimas)

  @Column({ type: "boolean", default: false })
  isByBox!: boolean; // Si es por caja (`true`) o tarima (`false`)

  @Column({ type: "decimal", precision: 10, scale: 2 })
    pricePerKilo!: number; // Precio específico de la remisión

    @Column({ type: "varchar", length: 10, nullable: true })
    claveSatSnapshot?: string; // Copia de la clave SAT al momento de la remisión

  @OneToMany(() => BoxWeight, (boxWeight) => boxWeight.remissionDetail, {
    cascade: true,
  })
  boxWeights!: BoxWeight[]; // Pesos individuales por caja
}
