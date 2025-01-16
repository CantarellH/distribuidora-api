import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Supplier } from "./Supplier";
import { InventoryEntryDetail } from "./InventoryEntryDetail";

@Entity("inventory_entries")
export class InventoryEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Supplier, { nullable: false, onDelete: "CASCADE" })
  supplier!: Supplier;

  @OneToMany(() => InventoryEntryDetail, (detail) => detail.inventoryEntry, {
    cascade: true,
  })
  details!: InventoryEntryDetail[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
