import { Board } from "../entity/Board";
import { getBoardById as getBoardByIdRepo } from "../repository/BoardRepository";

export async function getBoardById(id: number): Promise<Board | null> {
  return await getBoardByIdRepo(id);
}