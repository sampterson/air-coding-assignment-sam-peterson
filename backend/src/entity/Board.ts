import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;
}