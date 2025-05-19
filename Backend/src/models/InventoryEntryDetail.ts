import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { InventoryEntry } from "./InventoryEntry";
import { EggType } from "./EggType";

@Entity("inventory_entry_details")
export class InventoryEntryDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => InventoryEntry, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "inventory_entry_id" })
  inventoryEntry!: InventoryEntry;

  @ManyToOne(() => EggType, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "egg_type_id" })
  eggType!: EggType;

  @Column({ 
    name: "box_count", 
    type: "int",
    comment: "Número de cajas recibidas"
  })
  boxCount!: number;

  @Column({ 
    name: "weight_total", 
    type: "numeric", 
    precision: 10, 
    scale: 2,
    comment: "Peso total en kilogramos (incluye peso de empaques)"
  })
  weightTotal!: number;
  
  @Column({
    name: "unit_price",
    type: "decimal",
    precision: 10,
    scale: 2,
    comment: "Precio por kilogramo al momento de la entrada"
  })
  unitPrice!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
