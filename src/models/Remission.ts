import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Client } from "./Client";
import { RemissionDetail } from "./RemissionDetail";

@Entity()
export class Remission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: Date; 

  @ManyToOne(() => Client, (client) => client.remissions, { eager: true })
  client!: Client; 

  @OneToMany(() => RemissionDetail, (detail) => detail.remission, {
    cascade: true,
  })
  details!: RemissionDetail[]; 

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date; 
}
