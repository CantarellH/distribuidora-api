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
exports.EggTypeSupplier = void 0;
const typeorm_1 = require("typeorm");
const EggType_1 = require("./EggType");
const Supplier_1 = require("./Supplier");
let EggTypeSupplier = class EggTypeSupplier {
};
exports.EggTypeSupplier = EggTypeSupplier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EggTypeSupplier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EggType_1.EggType, (eggType) => eggType.eggTypeSuppliers, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", EggType_1.EggType)
], EggTypeSupplier.prototype, "eggType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier, (supplier) => supplier.eggTypeSuppliers, { eager: true, onDelete: "CASCADE" }),
    __metadata("design:type", Supplier_1.Supplier)
], EggTypeSupplier.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], EggTypeSupplier.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamp" }),
    __metadata("design:type", Date)
], EggTypeSupplier.prototype, "updatedAt", void 0);
exports.EggTypeSupplier = EggTypeSupplier = __decorate([
    (0, typeorm_1.Entity)("egg_type_supplier")
], EggTypeSupplier);
