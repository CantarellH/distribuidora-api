import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { EggType } from "./EggType";
  import { Supplier } from "./Supplier";
  
  @Entity("egg_type_supplier")
  export class EggTypeSupplier {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @ManyToOne(() => EggType, (eggType) => eggType.eggTypeSuppliers, { eager: true, onDelete: "CASCADE" })
    eggType!: EggType;
  
    @ManyToOne(() => Supplier, (supplier) => supplier.eggTypeSuppliers, { eager: true, onDelete: "CASCADE" })
    supplier!: Supplier;
  
    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
  
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;
  }
  