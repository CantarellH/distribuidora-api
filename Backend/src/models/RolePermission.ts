import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Role } from "./Role";
import { Permission } from "./Permission";

@Entity("role_permissions")
export class RolePermission {
  @PrimaryGeneratedColumn()
  id!: number;  // ← Usamos '!' para omitir la verificación de inicialización

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "role_id" })
  role!: Role;  // ← También aquí

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permission_id" })
  permission!: Permission; // ← Y aquí

  @Column({ type: "boolean", default: false })
  isActive!: boolean;  // ← Y aquí
}
