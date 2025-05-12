import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Remission } from "./Remission";
import { Payment } from "./Payment";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contact_info?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @OneToMany(() => Remission, (remission) => remission.client)
  remissions!: Remission[];

  @OneToMany(() => Payment, (payment) => payment.client)
  payments!: Payment[]; // Relación con los pagos

  @Column({ type: "boolean", default: true })
  status!: boolean;

  @Column({ type: "varchar", length: 13, nullable: true })
  rfc?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  emailFiscal?: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  regimenFiscal?: string;

  // Nueva estructura de dirección
  @Column({ type: "varchar", length: 100, nullable: true })
  calle?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  numeroExterior?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  numeroInterior?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  colonia?: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  codigoPostal?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  alcaldiaMunicipio?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  estado?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  pais?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  getDireccionCompleta(): string {
    return [
      this.calle,
      this.numeroExterior,
      this.numeroInterior ? `Int. ${this.numeroInterior}` : '',
      this.colonia,
      `C.P. ${this.codigoPostal}`,
      this.alcaldiaMunicipio,
      this.estado,
      this.pais
    ].filter(Boolean).join(', ');
  }

}
