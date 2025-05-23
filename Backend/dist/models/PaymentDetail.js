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
exports.PaymentDetail = void 0;
const typeorm_1 = require("typeorm");
const Payment_1 = require("./Payment");
const Remission_1 = require("./Remission");
let PaymentDetail = class PaymentDetail {
};
exports.PaymentDetail = PaymentDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Payment_1.Payment, payment => payment.paymentDetails, { onDelete: "CASCADE" }),
    __metadata("design:type", Payment_1.Payment)
], PaymentDetail.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Remission_1.Remission, remission => remission.paymentDetails, { onDelete: "CASCADE" }),
    __metadata("design:type", Remission_1.Remission)
], PaymentDetail.prototype, "remission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentDetail.prototype, "amountAssigned", void 0);
exports.PaymentDetail = PaymentDetail = __decorate([
    (0, typeorm_1.Entity)("payment_details")
], PaymentDetail);
