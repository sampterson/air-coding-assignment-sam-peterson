import { Board } from "../entity/Board";
import { changeBoardParentRepo, createBoardRepo, deleteBoardAndChildrenRepo, getBoardByIdRepo as getBoardByIdRepo, getDepthFromRoot, getMaxSubtreeDepth, getRootBoardsRepo } from "../repository/BoardRepository";

// Default to max depth of 10
const MAX_BOARD_DEPTH = Number(process.env.MAX_BOARD_DEPTH) || 10;

export async function getRootBoardsService(): Promise<Board[]> {
  console.log("[BoardService] Fetching root boards");
  return await getRootBoardsRepo();
}

export async function getBoardByIdService(id: number): Promise<Board | null> {
  console.log(`[BoardService] Fetching board by id: ${id}`);
  return await getBoardByIdRepo(id);
}

export async function createBoardService(
  name: string,
  description?: string,
  parentId?: number
): Promise<Board> {
  console.log(`[BoardService] Creating board: name="${name}", parentId=${parentId}`);
  let parent: Board | null = null;
  if (parentId) {
    parent = await getBoardByIdRepo(parentId);
    if (!parent) {
      console.warn(`[BoardService] Parent board not found: parentId=${parentId}`);
      throw new Error("Parent board not found");
    }
    const parentDepth = await getDepthFromRoot(parent);
    console.log(`[BoardService] Parent depth: ${parentDepth}, MAX_BOARD_DEPTH: ${MAX_BOARD_DEPTH}`);
    if (parentDepth + 1 > MAX_BOARD_DEPTH) {
      console.warn(`[BoardService] Max board depth exceeded: parentDepth+1=${parentDepth + 1}, MAX_BOARD_DEPTH=${MAX_BOARD_DEPTH}`);
      throw new Error("Max board depth exceeded");
    }
  }
  const board = await createBoardRepo(name, description, parent!);
  console.log(`[BoardService] Board created with id: ${board.id}`);
  return board;
}

export async function deleteBoardService(id: number): Promise<void> {
  console.log(`[BoardService] Deleting board and children: id=${id}`);
  await deleteBoardAndChildrenRepo(id);
  console.log(`[BoardService] Board and children deleted: id=${id}`);
}

export async function changeBoardParentService(boardId: number, newParentId: number): Promise<Board | null> {
  console.log(`[BoardService] Changing parent of board ${boardId} to ${newParentId}`);
  if (boardId === newParentId) {
    console.warn(`[BoardService] Attempted to set board as its own parent: boardId=${boardId}`);
    throw new Error("A board cannot be its own parent");
  }

  const board = await getBoardByIdRepo(boardId);
  if (!board) {
    console.warn(`[BoardService] Board not found: boardId=${boardId}`);
    throw new Error("Board not found");
  }

  let newParent: Board | null = null;
  let newParentDepth = 0;
  if (newParentId) {
    newParent = await getBoardByIdRepo(newParentId);
    if (!newParent) {
      console.warn(`[BoardService] New parent board not found: newParentId=${newParentId}`);
      throw new Error("New parent board not found");
    }
    newParentDepth = await getDepthFromRoot(newParent);
    console.log(`[BoardService] New parent depth: ${newParentDepth}`);
  }

  const subtreeDepth = await getMaxSubtreeDepth(board);
  console.log(`[BoardService] Subtree depth to move: ${subtreeDepth}, MAX_BOARD_DEPTH: ${MAX_BOARD_DEPTH}`);
  if (newParentDepth + subtreeDepth > MAX_BOARD_DEPTH) {
    console.warn(`[BoardService] Max board depth exceeded after move: newParentDepth+subtreeDepth=${newParentDepth + subtreeDepth}, MAX_BOARD_DEPTH=${MAX_BOARD_DEPTH}`);
    throw new Error("Max board depth exceeded");
  }

  const updatedBoard = await changeBoardParentRepo(boardId, newParentId);
  console.log(`[BoardService] Board parent changed: boardId=${boardId}, newParentId=${newParentId}`);
  return updatedBoard;
}