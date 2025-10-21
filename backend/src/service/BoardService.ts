import { Board } from "../entity/Board";
import { createBoardRepo, deleteBoardAndChildren, getBoardById as getBoardByIdRepo } from "../repository/BoardRepository";

export async function getBoardById(id: number): Promise<Board | null> {
  return await getBoardByIdRepo(id);
}

export async function createBoardService(
  name: string,
  description?: string,
  parentId?: number
): Promise<Board> {
  let parent: Board | null;
  if (parentId) {
    parent = await getBoardByIdRepo(parentId);
    if (!parent) {
      throw new Error("Parent board not found");
    }
  }
  return await createBoardRepo(name, description, parent!);
}

export async function deleteBoardService(id: number): Promise<void> {
  await deleteBoardAndChildren(id);
}