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
exports.InventoryEntryDetail = void 0;
const typeorm_1 = require("typeorm");
const InventoryEntry_1 = require("./InventoryEntry");
const EggType_1 = require("./EggType");
let InventoryEntryDetail = class InventoryEntryDetail {
};
exports.InventoryEntryDetail = InventoryEntryDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventoryEntryDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InventoryEntry_1.InventoryEntry, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "inventory_entry_id" }),
    __metadata("design:type", InventoryEntry_1.InventoryEntry)
], InventoryEntryDetail.prototype, "inventoryEntry", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EggType_1.EggType, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "egg_type_id" }),
    __metadata("design:type", EggType_1.EggType)
], InventoryEntryDetail.prototype, "eggType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "box_count", type: "int" }),
    __metadata("design:type", Number)
], InventoryEntryDetail.prototype, "boxCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "weight_total", type: "numeric", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InventoryEntryDetail.prototype, "weightTotal", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], InventoryEntryDetail.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], InventoryEntryDetail.prototype, "updatedAt", void 0);
exports.InventoryEntryDetail = InventoryEntryDetail = __decorate([
    (0, typeorm_1.Entity)("inventory_entry_details")
], InventoryEntryDetail);
