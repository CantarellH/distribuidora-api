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
exports.RemissionWeightDetail = void 0;
const typeorm_1 = require("typeorm");
const RemissionDetail_1 = require("./RemissionDetail");
let RemissionWeightDetail = class RemissionWeightDetail {
};
exports.RemissionWeightDetail = RemissionWeightDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RemissionWeightDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RemissionDetail_1.RemissionDetail, (detail) => detail.id, { onDelete: "CASCADE" }),
    __metadata("design:type", RemissionDetail_1.RemissionDetail)
], RemissionWeightDetail.prototype, "remissionDetail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float" }),
    __metadata("design:type", Number)
], RemissionWeightDetail.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Boolean)
], RemissionWeightDetail.prototype, "byBox", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RemissionWeightDetail.prototype, "createdAt", void 0);
exports.RemissionWeightDetail = RemissionWeightDetail = __decorate([
    (0, typeorm_1.Entity)("remission_weight_detail")
], RemissionWeightDetail);
