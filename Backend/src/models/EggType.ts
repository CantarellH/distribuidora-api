import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";
import { EggTypeSupplier } from "./EggTypeSupplier"; // Importar la relación

@Entity("egg_types")
export class EggType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @OneToMany(() => EggTypeSupplier, (eggTypeSupplier) => eggTypeSupplier.eggType)
  eggTypeSuppliers!: EggTypeSupplier[];

  @OneToMany(() => RemissionDetail, (remissionDetail) => remissionDetail.eggType)
  remissionDetails!: RemissionDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
