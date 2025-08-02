import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class InventoryEntryDetailDto {
  @IsInt()
  @IsPositive()
  eggTypeId: number;

  @IsInt()
  @IsPositive()
  boxCount: number;

  @IsNumber()
  @IsPositive()
  weightTotal: number;
}

export class CreateInventoryEntryDto {
  @IsInt()
  @IsPositive()
  supplierId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryEntryDetailDto)
  details: InventoryEntryDetailDto[];
}

export class UpdateInventoryEntryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryEntryDetailDto)
  details: InventoryEntryDetailDto[];
}

export class InventoryMovementFilterDto {
  @IsOptional()
  @IsInt()
  eggTypeId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  movementType?: string;
}

export class AdjustStockDto {
  @IsInt()
  @IsPositive()
  eggTypeId: number;

  @IsInt()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}