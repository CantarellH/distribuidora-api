import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { Client } from "./Client";
import { Remission } from "./Remission";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, (client) => client.payments, { onDelete: "CASCADE" })
  client!: Client;

  @OneToMany(() => Remission, (remission) => remission.payment)
  remissions!: Remission[];

  @Column({ type: "float" })
  amount!: number;

  @Column({ type: "varchar", length: 255 })
  method!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
