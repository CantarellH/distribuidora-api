import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";

@Entity()
export class RemissionWeightDetail {
  @PrimaryGeneratedColumn()
  id!: number; 

  @ManyToOne(() => RemissionDetail, (remissionDetail) => remissionDetail.weightDetails, { eager: true })
  remissionDetail!: RemissionDetail; 

  @Column("float")
  weight!: number; 

  @Column({ type: "boolean" })
  byBox!: boolean; 

  @CreateDateColumn()
  createdAt!: Date; 

  @UpdateDateColumn()
  updatedAt!: Date; 
}
