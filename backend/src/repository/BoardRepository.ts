import { IsNull } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Board } from '../entity/Board';

export async function getRootBoardsRepo(): Promise<Board[]> {
  const boardRepository = AppDataSource.getRepository(Board);
  return await boardRepository.find({ where: { parent: IsNull() } });
}

export async function getBoardByIdRepo(id: number): Promise<Board | null> {
  const boardRepository = AppDataSource.getRepository(Board);
  return await boardRepository.findOne({
    where: { id },
    relations: ['children'],
  });
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

export async function deleteBoardAndChildrenRepo(id: number): Promise<void> {
  const boardRepository = AppDataSource.getRepository(Board);

  const board = await boardRepository.findOne({
    where: { id },
    relations: ['children'],
  });

  if (!board) return;

  for (const child of board.children) {
    await deleteBoardAndChildrenRepo(child.id);
  }

  await boardRepository.delete(id);
}

export async function changeBoardParentRepo(
  boardId: number,
  newParentId: number
): Promise<Board | null> {
  const boardRepository = AppDataSource.getRepository(Board);

  const board = await boardRepository.findOne({
    where: { id: boardId },
    relations: ['parent'],
  });
  if (!board) return null;

  let newParent: Board | null = null;
  if (newParentId) {
    newParent = await boardRepository.findOneBy({ id: newParentId });
    if (!newParent) throw new Error('New parent board not found');
  }

  board.parent = newParent! || null;
  return await boardRepository.save(board);
}

export async function getDepthFromRoot(board: Board): Promise<number> {
  let depth = 1;
  let current = board;

  while (true) {
    const fullBoard = await AppDataSource.getRepository(Board).findOne({
      where: { id: current.id },
      relations: ['parent'],
    });
    if (!fullBoard?.parent) break;
    depth++;
    current = fullBoard.parent;
  }

  return depth;
}

export async function getMaxSubtreeDepth(board: Board): Promise<number> {
  const repo = AppDataSource.getRepository(Board);
  const children = await repo.find({ where: { parent: { id: board.id } } });
  if (!children.length) return 1;
  const childDepths = await Promise.all(
    children.map((child) => getMaxSubtreeDepth(child))
  );
  return 1 + Math.max(...childDepths);
}
