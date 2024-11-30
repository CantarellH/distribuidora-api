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
exports.Remission = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
let Remission = class Remission {
};
exports.Remission = Remission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Remission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "client_id" }),
    __metadata("design:type", Client_1.Client)
], Remission.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "note", type: "text", nullable: true }),
    __metadata("design:type", String)
], Remission.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_boxes", type: "int", default: 0 }),
    __metadata("design:type", Number)
], Remission.prototype, "totalBoxes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_net_weight", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Remission.prototype, "totalNetWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_amount", type: "numeric", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Remission.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "status", type: "varchar", length: 20, default: "Pendiente" }),
    __metadata("design:type", String)
], Remission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "remission_date" }),
    __metadata("design:type", Date)
], Remission.prototype, "remissionDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Remission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Remission.prototype, "updatedAt", void 0);
exports.Remission = Remission = __decorate([
    (0, typeorm_1.Entity)("remissions")
], Remission);
