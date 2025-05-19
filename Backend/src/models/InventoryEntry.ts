import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";
import { Supplier } from "./Supplier";
import { InventoryEntryDetail } from "./InventoryEntryDetail";

@Entity("inventory_entries")
export class InventoryEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Supplier, { 
    nullable: false, 
    onDelete: "CASCADE",
    eager: true // Cargar proveedor automáticamente
  })
  supplier!: Supplier;

  @OneToMany(() => InventoryEntryDetail, (detail) => detail.inventoryEntry, {
    cascade: true,
    eager: true // Cargar detalles automáticamente
  })
  details!: InventoryEntryDetail[];

  @Column({
    type: "varchar",
    length: 50,
    nullable: true,
    comment: "Número de factura o documento del proveedor"
  })
  supplierDocument?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
