import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Board } from './Board';

@Entity()
export class CreativeAsset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // e.g., 'png', 'jpg', etc.

  @Column()
  url!: string;

  @ManyToOne(() => Board, (board) => board.assets)
  board!: Board;
}
