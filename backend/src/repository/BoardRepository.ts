
import { AppDataSource } from "../data-source";
import { Board } from "../entity/Board";

export async function getBoardById(id: number): Promise<Board | null> {
  const boardRepository = AppDataSource.getRepository(Board);
  return await boardRepository.findOneBy({ id });
}