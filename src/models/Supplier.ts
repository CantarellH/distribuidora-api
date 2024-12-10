import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { RemissionDetail } from "./RemissionDetail";

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: true }) // Cambiado a nullable: true
name?: string;


  @Column({ type: "varchar", length: 255, nullable: true })
  contact_info?: string;

  @OneToMany(() => RemissionDetail, (remissionDetail) => remissionDetail.supplier)
  remissionDetails!: RemissionDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
