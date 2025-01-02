import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";

@Entity('box_weight')
export class BoxWeight {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => RemissionDetail, (remissionDetail) => remissionDetail.boxWeights, {
    nullable: true, // Permitir valores nulos temporalmente
    onDelete: "CASCADE",
  })
  remissionDetail!: RemissionDetail | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  weight!: number; // Peso individual por caja
}