import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { CreativeAsset } from "./CreativeAsset";


@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  // Self-referencing parent
  @ManyToOne(() => Board, (board) => board.children, { nullable: true })
  parent?: Board;

  // Children boards
  @OneToMany(() => Board, (board) => board.parent)
  children!: Board[];

  // Creative assets
  @OneToMany(() => CreativeAsset, (asset) => asset.board)
  assets!: CreativeAsset[];
}