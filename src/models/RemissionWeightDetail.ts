import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";

@Entity("remission_weight_detail")
export class RemissionWeightDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => RemissionDetail, (detail) => detail.id, { onDelete: "CASCADE" })
  remissionDetail!: RemissionDetail;

  @Column({ type: "float" })
  weight!: number;

  @Column({ type: "int" })
  byBox!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
