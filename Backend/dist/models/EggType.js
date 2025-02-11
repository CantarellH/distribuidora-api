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
exports.EggType = void 0;
const typeorm_1 = require("typeorm");
const RemissionDetail_1 = require("./RemissionDetail");
const EggTypeSupplier_1 = require("./EggTypeSupplier"); // Importar la relación
let EggType = class EggType {
};
exports.EggType = EggType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EggType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], EggType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], EggType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EggTypeSupplier_1.EggTypeSupplier, (eggTypeSupplier) => eggTypeSupplier.eggType),
    __metadata("design:type", Array)
], EggType.prototype, "eggTypeSuppliers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RemissionDetail_1.RemissionDetail, (remissionDetail) => remissionDetail.eggType),
    __metadata("design:type", Array)
], EggType.prototype, "remissionDetails", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EggType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EggType.prototype, "updatedAt", void 0);
exports.EggType = EggType = __decorate([
    (0, typeorm_1.Entity)("egg_types")
], EggType);
