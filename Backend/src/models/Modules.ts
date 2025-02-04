// models/Module.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from "typeorm";
  import { Permission } from "./Permission";
  import { RoleModule } from "./RoleModule";
  
  @Entity("modules")
  export class Module {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ unique: true, default: "default_name" })
    name!: string;
  
    @OneToMany(() => Permission, (permission) => permission.module)
    permissions?: Permission[];
  
    // <-- NUEVO: Relación con RoleModule
    @OneToMany(() => RoleModule, (roleModule) => roleModule.module)
    roleModules?: RoleModule[];
  }
  