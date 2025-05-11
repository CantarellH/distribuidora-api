import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { EggType } from "./EggType";

export enum MovementType {
  ENTRY = 'ENTRY',
  ADJUSTMENT = 'ADJUSTMENT',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  REMISSION = 'REMISSION'
}

@Entity()
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EggType, eggType => eggType.movements)
  eggType!: EggType;

  @Column({
    type: "enum",
    enum: MovementType,
    default: MovementType.ENTRY
  })
  movementType!: MovementType;

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  currentStock!: number;

  @Column({ nullable: true })
  referenceId?: number;

  @Column()
  details!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}