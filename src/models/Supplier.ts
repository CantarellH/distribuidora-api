import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { InventoryEntry } from "./InventoryEntry";

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  contact_info?: string; // Información adicional como teléfono, dirección, etc.

  @OneToMany(() => InventoryEntry, (entry) => entry.supplier)
  inventoryEntries?: InventoryEntry[];
}
