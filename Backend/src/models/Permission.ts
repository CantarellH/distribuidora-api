// models/Permission.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne
} from "typeorm";
import { RolePermission } from "./RolePermission";
import { Module } from "./Modules";

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, default: "default_name" })
  name!: string;

  @ManyToOne(() => Module, (module) => module.permissions, { nullable: true })
module?: Module;

  @Column({ nullable: true })
  description?: string;

  // Relación con la tabla pivote "role_permissions"
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions?: RolePermission[];
}
