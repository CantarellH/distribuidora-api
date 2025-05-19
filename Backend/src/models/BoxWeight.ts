import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";

@Entity('box_weights') // Mejor nombre de tabla plural
export class BoxWeight {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => RemissionDetail, (remissionDetail) => remissionDetail.boxWeights, {
    nullable: false, // Eliminar nullable ya que debe tener relación
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: 'remission_detail_id' }) // Explicitar nombre de columna
  remissionDetail!: RemissionDetail;

  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    comment: "Peso neto de la caja (sin incluir el peso del empaque)"
  })
  weight!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true })
  updatedAt?: Date; // Hacer opcional ya que al crearse no tiene actualización
}