
import { IsDefined, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';


export class CreateEggTypeDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  claveSat!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  unidadSat!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  claveUnidadSat!: string;

  @IsOptional()
  @IsNumber()
  supplierId?: number;
}



export class UpdateEggTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  claveSat?: string;

  @IsOptional()
  @IsString()
  unidadSat?: string;

  @IsOptional()
  @IsString()
  claveUnidadSat?: string;

  @IsOptional()
  @IsNumber()
  supplierId?: number;
}

export class PaginationParams {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}