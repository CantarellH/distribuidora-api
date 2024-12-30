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
const Client_1 = require("./Client"); // Asegúrate de tener definido el modelo Client adecuadamente.
const RemissionDetail_1 = require("./RemissionDetail");
const PaymentDetail_1 = require("./PaymentDetail");
let Remission = class Remission {
};
exports.Remission = Remission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Remission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client, client => client.remissions),
    __metadata("design:type", Client_1.Client)
], Remission.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RemissionDetail_1.RemissionDetail, detail => detail.remission, { cascade: true }),
    __metadata("design:type", Array)
], Remission.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Remission.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Remission.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Remission.prototype, "isPaid", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Remission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Remission.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PaymentDetail_1.PaymentDetail, paymentDetail => paymentDetail.remission, { cascade: true }),
    __metadata("design:type", Array)
], Remission.prototype, "paymentDetails", void 0);
exports.Remission = Remission = __decorate([
    (0, typeorm_1.Entity)("remissions")
], Remission);
