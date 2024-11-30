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
const EggType_1 = require("./EggType");
const Supplier_1 = require("./Supplier");
let RemissionDetail = class RemissionDetail {
};
exports.RemissionDetail = RemissionDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Remission_1.Remission, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "remission_id" }),
    __metadata("design:type", Remission_1.Remission)
], RemissionDetail.prototype, "remission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EggType_1.EggType, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "egg_type_id" }),
    __metadata("design:type", EggType_1.EggType)
], RemissionDetail.prototype, "eggType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Supplier_1.Supplier, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "supplier_id" }),
    __metadata("design:type", Supplier_1.Supplier)
], RemissionDetail.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "weight_type", type: "int" }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "weightType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "box_count", type: "int" }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "boxCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "weight_total", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "weightTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tara_total", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "taraTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "net_weight", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "netWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_per_kg", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "pricePerKg", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subtotal", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], RemissionDetail.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], RemissionDetail.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], RemissionDetail.prototype, "updatedAt", void 0);
exports.RemissionDetail = RemissionDetail = __decorate([
    (0, typeorm_1.Entity)("remission_details")
], RemissionDetail);
