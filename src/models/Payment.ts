import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Client } from "./Client";
import { Remission } from "./Remission";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, (client) => client.payments, { onDelete: "CASCADE" })
  client!: Client;

  @OneToMany(() => Remission, (remission) => remission.payments)
  remissions!: Remission[];

  @Column({ type: "float" })
  amount!: number;

  @Column({ type: "varchar", length: 255 })
  method!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
