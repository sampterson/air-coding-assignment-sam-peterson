import { IsNull } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Board } from '../entity/Board';

export async function getRootBoardsRepo(): Promise<Board[]> {
  const boardRepository = AppDataSource.getRepository(Board);
  console.log("[BoardRepository] Fetching root boards (parent IS NULL)");
  const roots = await boardRepository.find({ where: { parent: IsNull() } });
  console.log(`[BoardRepository] Found ${roots.length} root boards`);
  return roots;
}

export async function getBoardByIdRepo(id: number): Promise<Board | null> {
  const boardRepository = AppDataSource.getRepository(Board);
  console.log(`[BoardRepository] Fetching board by id: ${id} (with children)`);
  const board = await boardRepository.findOne({
    where: { id },
    relations: ['children'],
  });
  if (!board) {
    console.warn(`[BoardRepository] Board not found: id=${id}`);
    return null;
  }
  console.log(`[BoardRepository] Board found: id=${id}, children=${board.children.length}`);
  return board;
}

export async function createBoardRepo(
  name: string,
  description?: string,
  parent?: Board
): Promise<Board> {
  const boardRepository = AppDataSource.getRepository(Board);
  console.log(`[BoardRepository] Creating board: name="${name}", parentId=${parent?.id ?? "null"}`);
  const board = boardRepository.create({ name, description, parent });
  const saved = await boardRepository.save(board);
  console.log(`[BoardRepository] Board created with id: ${saved.id}`);
  return saved;
}

export async function deleteBoardAndChildrenRepo(id: number): Promise<void> {
  const boardRepository = AppDataSource.getRepository(Board);

  console.log(`[BoardRepository] Deleting board and its children: id=${id}`);
  const board = await boardRepository.findOne({
    where: { id },
    relations: ['children'],
  });

  if (!board) {
    console.warn(`[BoardRepository] Board not found for delete: id=${id}`);
    return;
  }

  for (const child of board.children) {
    await deleteBoardAndChildrenRepo(child.id);
  }

  await boardRepository.delete(id);
  console.log(`[BoardRepository] Board deleted: id=${id}`);
}

export async function changeBoardParentRepo(
  boardId: number,
  newParentId: number
): Promise<Board | null> {
  const boardRepository = AppDataSource.getRepository(Board);

  console.log(`[BoardRepository] Changing parent of board ${boardId} to ${newParentId}`);
  const board = await boardRepository.findOne({
    where: { id: boardId },
    relations: ['parent'],
  });
  if (!board) {
    console.warn(`[BoardRepository] Board not found: id=${boardId}`);
    return null;
  }

  let newParent: Board | null = null;
  if (newParentId) {
    newParent = await boardRepository.findOneBy({ id: newParentId });
    if (!newParent) {
      console.warn(`[BoardRepository] New parent board not found: id=${newParentId}`);
      throw new Error('New parent board not found');
    }
  }

  board.parent = newParent! || null;
  const updated = await boardRepository.save(board);
  console.log(`[BoardRepository] Board parent updated: boardId=${boardId}, newParentId=${newParentId}`);
  return updated;
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

  console.log(`[BoardRepository] Calculated depth from root for board id=${board.id}: depth=${depth}`);
  return depth;
}

export async function getMaxSubtreeDepth(board: Board): Promise<number> {
  const repo = AppDataSource.getRepository(Board);
  const children = await repo.find({ where: { parent: { id: board.id } } });
  if (!children.length) {
    console.log(`[BoardRepository] Max subtree depth for board id=${board.id}: 1 (no children)`);
    return 1;
  }
  const childDepths = await Promise.all(
    children.map((child) => getMaxSubtreeDepth(child))
  );
  const maxDepth = 1 + Math.max(...childDepths);
  console.log(`[BoardRepository] Max subtree depth for board id=${board.id}: ${maxDepth}`);
  return maxDepth;
}