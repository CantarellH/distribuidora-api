import { DataSource } from "typeorm";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { Role } from "../models/Role";
import { Module } from "../models/Modules";
import { RoleModule } from "../models/RoleModule";
import { Permission } from "../models/Permission";
import { RolePermission } from "../models/RolePermission";
import { User } from "../models/User";

async function seedAdminDatabase(dataSource: DataSource) {
 
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const moduleRepo = dataSource.getRepository(Module);
  const permissionRepo = dataSource.getRepository(Permission);
  const roleModuleRepo = dataSource.getRepository(RoleModule);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  // Crear rol Administrador si no existe
  let adminRole = await roleRepo.findOne({ where: { name: "Administrador" } });
  if (!adminRole) {
    adminRole = roleRepo.create({ name: "Administrador", permissions: [] });
    await roleRepo.save(adminRole);
  }
  // Asignar todos los módulos al rol administrador
  const modules = await moduleRepo.find();
  for (const module of modules) {
    const exists = await roleModuleRepo.findOne({
      where: { role: { id: adminRole.id }, module: { id: module.id } },
    });

    if (!exists) {
      const roleModule = new RoleModule();
      roleModule.role = adminRole;
      roleModule.module = module;
      roleModule.isActive = true;
      await roleModuleRepo.save(roleModule);
    }
  }

  // Asignar todos los permisos al rol administrador
  const permissions = await permissionRepo.find();
  for (const permission of permissions) {
    const exists = await rolePermissionRepo.findOne({
      where: { role: { id: adminRole.id }, permission: { id: permission.id } },
    });

    if (!exists) {
      const rolePermission = new RolePermission();
      rolePermission.role = adminRole;
      rolePermission.permission = permission;
      rolePermission.isActive = true;
      await rolePermissionRepo.save(rolePermission);
    }
  }

  // Crear usuario admin si no existe
  let adminUser = await userRepo.findOne({ where: { username: "admin" } });
  if (!adminUser) {
    adminUser = userRepo.create({
      username: "admin",
      password: bcrypt.hashSync("admin", 10),
      role: adminRole,
      status: true,
    });
    await userRepo.save(adminUser);
  }

  console.log(
    "✅ Seed completo: rol administrador con todos los módulos y permisos asignados."
  );
}

seedAdminDatabase(AppDataSource).catch(console.error);
export { seedAdminDatabase };