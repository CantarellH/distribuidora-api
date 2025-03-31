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

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  name?: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  phone_number?: string;
  
  @Column({ type: "varchar", length: 100, nullable: true })
  email?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @OneToMany(() => EggTypeSupplier, (eggTypeSupplier) => eggTypeSupplier.supplier)
  eggTypeSuppliers!: EggTypeSupplier[];

  @OneToMany(() => RemissionDetail, (detail) => detail.supplier)
  remissionDetails!: RemissionDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
