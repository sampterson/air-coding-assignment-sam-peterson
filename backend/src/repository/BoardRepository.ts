
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

export async function deleteBoardAndChildren(id: number): Promise<void> {
  const boardRepository = AppDataSource.getRepository(Board);

  const board = await boardRepository.findOne({
    where: { id },
    relations: ["children"],
  });

  if (!board) return;

  for (const child of board.children) {
    await deleteBoardAndChildren(child.id);
  }

  await boardRepository.delete(id);
}