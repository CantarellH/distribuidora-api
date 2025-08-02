import { IsOptional, IsString, IsBoolean, IsEmail, IsPostalCode, IsIn } from 'class-validator';
import { PaginationParams } from './common.dto';

// Lista de regímenes fiscales del SAT (ejemplo, actualizar con lista completa)
const REGIMENES_FISCALES = [
  '601', '603', '605', '606', '607', '608', '609', '610', '611', '612', '614', '615', '616', '620', '621', '622', '623', '624', '625', '626'
];

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  contact_info: string;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsEmail()
  emailFiscal?: string;

  @IsOptional()
  @IsIn(REGIMENES_FISCALES)
  regimenFiscal?: string;

  @IsOptional()
  @IsString()
  calle?: string;

  @IsOptional()
  @IsString()
  numeroExterior?: string;

  @IsOptional()
  @IsString()
  numeroInterior?: string;

  @IsOptional()
  @IsString()
  colonia?: string;

  @IsOptional()
  @IsPostalCode('MX')
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  alcaldiaMunicipio?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  pais?: string;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contact_info?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsEmail()
  emailFiscal?: string;

  @IsOptional()
  @IsIn(REGIMENES_FISCALES)
  regimenFiscal?: string;

  @IsOptional()
  @IsString()
  calle?: string;

  @IsOptional()
  @IsString()
  numeroExterior?: string;

  @IsOptional()
  @IsString()
  numeroInterior?: string;

  @IsOptional()
  @IsString()
  colonia?: string;

  @IsOptional()
  @IsPostalCode('MX')
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  alcaldiaMunicipio?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  pais?: string;
}

export interface ClientResponse extends Client {
  direccionCompleta: string;
}

export interface PaginatedClientResponse {
  data: ClientResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}