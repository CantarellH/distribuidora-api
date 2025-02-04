// models/Role.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { RolePermission } from "./RolePermission";
import { RoleModule } from "./RoleModule";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, default: "Default Role" })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => User, (user) => user.role, { nullable: true })
  users?: User[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions?: RolePermission[];

  // <-- NUEVO: Relación con RoleModule
  @OneToMany(() => RoleModule, (roleModule) => roleModule.role)
  roleModules?: RoleModule[];
}
