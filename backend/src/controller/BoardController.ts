import { Request, Response } from 'express';
import {
  changeBoardParentService,
  createBoardService,
  deleteBoardService,
  getBoardByIdService,
  getRootBoardsService,
} from '../service/BoardService';

export async function getBoards(req: Request, res: Response) {
  try {
    console.log("[GET /board] Fetching all root boards");
    const rootBoards = await getRootBoardsService();
    console.log(`[GET /board] Found ${rootBoards.length} root boards`);
    return res.json(rootBoards);
  } catch (err) {
    console.error("[GET /board] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    console.warn(`[GET /board/${req.params.id}] Invalid board id`);
    return res.status(400).json({ error: 'Invalid board id' });
  }

  console.log(`[GET /board/${id}] Fetching board`);
  const board = await getBoardByIdService(id);
  if (!board) {
    console.warn(`[GET /board/${id}] Board not found`);
    return res.status(404).json({ error: 'Board not found' });
  }

  console.log(`[GET /board/${id}] Board found`);
  return res.json(board);
}

export async function createBoard(req: Request, res: Response) {
  console.log("[POST /board] Request body:", req.body);
  const { name, description, parentId } = req.body;

  if (!name) {
    console.warn("[POST /board] Name is required");
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const board = await createBoardService(name, description, parentId);
    console.log(`[POST /board] Board created with id ${board.id}`);
    return res.status(201).json(board);
  } catch (err: any) {
    if (
      err.message === 'Parent board not found' ||
      err.message === 'Max board depth exceeded'
    ) {
      console.warn(`[POST /board] ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    console.error("[POST /board] Error:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    console.warn(`[DELETE /board/${req.params.id}] Invalid board id`);
    return res.status(400).json({ error: 'Invalid board id' });
  }

  try {
    await deleteBoardService(id);
    console.log(`[DELETE /board/${id}] Board deleted`);
    return res.status(204).send();
  } catch (err) {
    console.error(`[DELETE /board/${id}] Error:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function changeParentBoard(req: Request, res: Response) {
  const boardId = Number(req.params.id);
  const { newParentId } = req.body;

  if (isNaN(boardId) || isNaN(newParentId)) {
    console.warn(`[PUT /board/${req.params.id}/change-parent] Invalid board id or new parent id`);
    return res.status(400).json({ error: 'Invalid board id or new parent id' });
  }

  try {
    const updatedBoard = await changeBoardParentService(boardId, newParentId);
    console.log(`[PUT /board/${boardId}/change-parent] Board parent changed to ${newParentId}`);
    return res.json(updatedBoard);
  } catch (err: any) {
    if (err.message === 'Board not found') {
      console.warn(`[PUT /board/${boardId}/change-parent] Board not found`);
      return res.status(404).json({ error: 'Board not found' });
    } else if (
      err.message === 'New parent board not found' ||
      err.message === 'A board cannot be its own parent' ||
      err.message === 'Max board depth exceeded'
    ) {
      console.warn(`[PUT /board/${boardId}/change-parent] ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    console.error(`[PUT /board/${boardId}/change-parent] Error:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}