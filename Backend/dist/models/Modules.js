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
exports.Module = void 0;
// models/Module.ts
const typeorm_1 = require("typeorm");
const Permission_1 = require("./Permission");
const RoleModule_1 = require("./RoleModule");
let Module = class Module {
};
exports.Module = Module;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Module.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, default: "default_name" }),
    __metadata("design:type", String)
], Module.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Permission_1.Permission, (permission) => permission.module),
    __metadata("design:type", Array)
], Module.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RoleModule_1.RoleModule, (roleModule) => roleModule.module),
    __metadata("design:type", Array)
], Module.prototype, "roleModules", void 0);
exports.Module = Module = __decorate([
    (0, typeorm_1.Entity)("modules")
], Module);
