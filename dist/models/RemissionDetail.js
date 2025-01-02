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
exports.RemissionDetail = void 0;
const typeorm_1 = require("typeorm");
const Remission_1 = require("./Remission");
const BoxWeight_1 = require("./BoxWeight");
const EggType_1 = require("./EggType"); // Asumimos que tienes un modelo para EggType.
const Supplier_1 = require("./Supplier"); // Asumimos que tienes un modelo para Supplier.
let RemissionDetail = class RemissionDetail {
};
exports.RemissionDetail = RemissionDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Remission_1.Remission, (remission) => remission.details, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Remission_1.Remission)
], RemissionDetail.prototype, "remission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EggType_1.EggType),
    __metadata("design:type", EggType_1.EggType)
], RemissionDetail.prototype, "eggType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier),
    __metadata("design:type", Supplier_1.Supplier)
], RemissionDetail.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "boxCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "weightTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "estimatedWeightPerBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], RemissionDetail.prototype, "isByBox", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BoxWeight_1.BoxWeight, (boxWeight) => boxWeight.remissionDetail, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], RemissionDetail.prototype, "boxWeights", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "pricePerKilo", void 0);
exports.RemissionDetail = RemissionDetail = __decorate([
    (0, typeorm_1.Entity)()
], RemissionDetail);
