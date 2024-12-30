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

  @ManyToOne(() => RemissionDetail, remissionDetail => remissionDetail.boxWeights, { onDelete: "CASCADE" })
  remissionDetail!: RemissionDetail;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  weight!: number; // Peso de la caja individual
}
