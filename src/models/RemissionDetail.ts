import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Remission } from "./Remission";
import { EggType } from "./EggType";
import { Supplier } from "./Supplier";
import { RemissionWeightDetail } from "./RemissionWeightDetail";

@Entity()
export class RemissionDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Remission, (remission) => remission.details, { eager: true })
  remission!: Remission; 

  @ManyToOne(() => EggType, { eager: true })
  eggType!: EggType;

  @ManyToOne(() => Supplier, { eager: true })
  supplier!: Supplier; 

  @Column()
  boxCount!: number;

  @OneToMany(
    () => RemissionWeightDetail,
    (weightDetail) => weightDetail.remissionDetail,
    { cascade: true }
  )
  weightDetails!: RemissionWeightDetail[]; 
  @CreateDateColumn()
  createdAt!: Date; 
  @UpdateDateColumn()
  updatedAt!: Date; 
}
