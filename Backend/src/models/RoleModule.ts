// models/RoleModule.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { Role } from "./Role";
  import { Module } from "./Modules";
  
  @Entity("role_modules")
  export class RoleModule {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @ManyToOne(() => Role, (role) => role.roleModules, { onDelete: "CASCADE" })
    @JoinColumn({ name: "role_id" })
    role!: Role;
  
    @ManyToOne(() => Module, (module) => module.roleModules, { onDelete: "CASCADE" })
    @JoinColumn({ name: "module_id" })
    module!: Module;
  
    @Column({ type: "boolean", default: false })
    isActive!: boolean;
  }
  