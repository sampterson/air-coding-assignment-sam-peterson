import { Board } from "../entity/Board";
import { changeBoardParentRepo, createBoardRepo, deleteBoardAndChildrenRepo, getBoardByIdRepo as getBoardByIdRepo, getDepthFromRoot, getMaxSubtreeDepth, getRootBoardsRepo } from "../repository/BoardRepository";

// Default to max depth of 10
const MAX_BOARD_DEPTH = Number(process.env.MAX_BOARD_DEPTH) || 10;

export async function getRootBoardsService(): Promise<Board[]> {
  return await getRootBoardsRepo();
}

export async function getBoardByIdService(id: number): Promise<Board | null> {
  return await getBoardByIdRepo(id);
}

export async function createBoardService(
  name: string,
  description?: string,
  parentId?: number
): Promise<Board> {
  let parent: Board | null = null;
  if (parentId) {
    parent = await getBoardByIdRepo(parentId);
    if (!parent) {
      throw new Error("Parent board not found");
    }
    const parentDepth = await getDepthFromRoot(parent);
    if (parentDepth + 1 > MAX_BOARD_DEPTH) {
      console.log("Should be throwing this")
      throw new Error("Max board depth exceeded");
    }
  }
  return await createBoardRepo(name, description, parent!);
}

export async function deleteBoardService(id: number): Promise<void> {
  await deleteBoardAndChildrenRepo(id);
}

export async function changeBoardParentService(boardId: number, newParentId: number): Promise<Board | null> {
  if (boardId === newParentId) {
    throw new Error("A board cannot be its own parent");
  }

  const board = await getBoardByIdRepo(boardId);
  if (!board) throw new Error("Board not found");

  let newParent: Board | null = null;
  let newParentDepth = 0;
  if (newParentId) {
    newParent = await getBoardByIdRepo(newParentId);
    if (!newParent) throw new Error("New parent board not found");
    newParentDepth = await getDepthFromRoot(newParent);
  }

  const subtreeDepth = await getMaxSubtreeDepth(board);
  if (newParentDepth + subtreeDepth > MAX_BOARD_DEPTH) {
    throw new Error("Max board depth exceeded");
  }

  return await changeBoardParentRepo(boardId, newParentId);
}