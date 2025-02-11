"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModule = void 0;
// models/RoleModule.ts
const typeorm_1 = require("typeorm");
const Role_1 = require("./Role");
const Modules_1 = require("./Modules");
let RoleModule = class RoleModule {
};
exports.RoleModule = RoleModule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RoleModule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Role_1.Role, (role) => role.roleModules, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "role_id" }),
    __metadata("design:type", Role_1.Role)
], RoleModule.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Modules_1.Module, (module) => module.roleModules, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "module_id" }),
    __metadata("design:type", Modules_1.Module)
], RoleModule.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], RoleModule.prototype, "isActive", void 0);
exports.RoleModule = RoleModule = __decorate([
    (0, typeorm_1.Entity)("role_modules")
], RoleModule);
