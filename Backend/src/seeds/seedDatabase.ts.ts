import { DataSource } from "typeorm";
import { Module } from "../models/Modules";
import { Permission } from "../models/Permission";
import { AppDataSource } from "../config/data-source";

const modulesData = [
  { name: "Clientes" },
  { name: "Tipos de Huevo" },
  { name: "Inventario" },
  { name: "Módulos" },
  { name: "Pagos" },
  { name: "Remisiones" },
  { name: "Roles" },
  { name: "Proveedores" },
  { name: "Usuarios" },
];

const permissionsData = [
  {
    module: "Clientes",
    name: "create_clients",
    description: "Crear Clientes",
  },
  {
    module: "Clientes",
    name: "delete_clients",
    description: "Eliminar Clientes",
  },
  {
    module: "Clientes",
    name: "update_clients",
    description: "Actualizar Clientes",
  },
  { module: "Clientes", name: "view_clients", description: "Ver Clientes" },
  {
    module: "Inventario",
    name: "create_inventory",
    description: "Crear Elementos Inventario",
  },
  {
    module: "Inventario",
    name: "delete_inventory",
    description: "Eliminar Elementos Inventario",
  },
  {
    module: "Inventario",
    name: "update_inventory",
    description: "Actualizar Elementos Inventario",
  },
  {
    module: "Inventario",
    name: "view_inventory",
    description: "Ver Elementos Inventario",
  },
  {
    module: "Módulos",
    name: "assign_modules",
    description: "Asignar Modulos",
  },
  {
    module: "Módulos",
    name: "create_modules",
    description: "Crear Modulos",
  },
  {
    module: "Módulos",
    name: "remove_modules",
    description: "Gestionar Modulos",
  },
  { module: "Módulos", name: "view_modules", description: "Ver Modulos" },
  {
    module: "Módulos",
    name: "view_user_modules",
    description: "Ver User Modulos",
  },
  { module: "Pagos", name: "create_payment", description: "Crear Pagos" },
  { module: "Pagos", name: "delete_payment", description: "Eliminar Pagos" },
  { module: "Pagos", name: "update_payment", description: "Actualizar Pagos" },
  { module: "Pagos", name: "view_payment", description: "Ver Pagos" },
  {
    module: "Proveedores",
    name: "create_suppliers",
    description: "Crear Proveedores",
  },
  {
    module: "Proveedores",
    name: "delete_suppliers",
    description: "Eliminar Proveedores",
  },
  {
    module: "Proveedores",
    name: "update_suppliers",
    description: "Actualizar Proveedores",
  },
  {
    module: "Proveedores",
    name: "view_suppliers",
    description: "Ver Proveedores",
  },
  {
    module: "Remisiones",
    name: "create_remission",
    description: "Crear Remisiones",
  },
  {
    module: "Remisiones",
    name: "delete_remission",
    description: "Eliminar Remisiones",
  },
  {
    module: "Remisiones",
    name: "update_remission",
    description: "Actualizar Remisiones",
  },
  {
    module: "Remisiones",
    name: "view_remission",
    description: "Ver Remisiones",
  },
  {
    module: "Roles",
    name: "assign_permissions",
    description: "Asignar Permisos",
  },
  { module: "Roles", name: "create_roles", description: "Crear Roles" },
  {
    module: "Roles",
    name: "remove_permissions",
    description: "ELiminar Permisos",
  },
  { module: "Roles", name: "user_permissions", description: "Ver Permisos" },
  { module: "Roles", name: "view_roles", description: "Ver Roles" },
  {
    module: "Tipos de Huevo",
    name: "create_egg_types",
    description: "Crear Tipos de Huevo",
  },
  {
    module: "Tipos de Huevo",
    name: "delete_egg_types",
    description: "Eliminar Tipos de Huevo",
  },
  {
    module: "Tipos de Huevo",
    name: "update_egg_types",
    description: "Actualizar Tipos de Huevo",
  },
  {
    module: "Tipos de Huevo",
    name: "view_egg_types",
    description: "Ver Tipos de Huevo",
  },
  { module: "Usuarios", name: "check_user", description: "Verificar Usuario" },
  { module: "Usuarios", name: "create_user", description: "Crear Usuario" },
  { module: "Usuarios", name: "delete_user", description: "Eliminar Usuario" },
  {
    module: "Usuarios",
    name: "update_user",
    description: "Actualizar Usuario",
  },
  { module: "Usuarios", name: "view_users", description: "Ver Usuario" },
];
export default permissionsData;

async function seedDatabase(dataSource: DataSource) {


  console.log("🔄 Iniciando la inserción de módulos y permisos...");

  const moduleRepo = dataSource.getRepository(Module);
  const permissionRepo = dataSource.getRepository(Permission);

  // Insertar módulos si no existen y almacenar sus referencias
  const moduleMap = new Map<string, Module>();

  for (const mod of modulesData) {
    let moduleEntity = await moduleRepo.findOne({ where: { name: mod.name } });
    if (!moduleEntity) {
      moduleEntity = await moduleRepo.save(mod);
    }
    moduleMap.set(mod.name, moduleEntity); // Guardamos el objeto Module
  }

  console.log("✅ Módulos insertados y mapeados correctamente.");

  // Insertar permisos con la relación correcta al módulo
  for (const perm of permissionsData) {
    const moduleEntity = moduleMap.get(perm.module);

    if (moduleEntity) {
      const exists = await permissionRepo.findOne({
        where: { name: perm.name },
      });

      if (!exists) {
        const newPermission = permissionRepo.create({
          name: perm.name,
          description: perm.description,
          module: moduleEntity, // PASAMOS EL OBJETO EN LUGAR DEL ID
        });

        await permissionRepo.save(newPermission);
      }
    } else {
      console.warn(`⚠️ Módulo no encontrado para el permiso: ${perm.name}`);
    }
  }

  console.log(
    "✅ Permisos insertados y correctamente relacionados con módulos."
  );
}

// 🔥 EXPORTAR LA FUNCIÓN
export { seedDatabase };
