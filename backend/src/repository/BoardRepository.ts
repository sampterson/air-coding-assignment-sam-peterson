
import { AppDataSource } from "../data-source";
import { Board } from "../entity/Board";

export async function getBoardById(id: number): Promise<Board | null> {
  const boardRepository = AppDataSource.getRepository(Board);
  return await boardRepository.findOneBy({ id });
}

export async function createBoardRepo(
  name: string,
  description?: string,
  parent?: Board
): Promise<Board> {
  const boardRepository = AppDataSource.getRepository(Board);
  const board = boardRepository.create({ name, description, parent });
  return await boardRepository.save(board);
}