import { Request, Response } from 'express';
import { getBoardByIdRepo } from '../repository/BoardRepository';
import { AppDataSource } from '../data-source';
import { Board } from '../entity/Board';
import {
  changeBoardParentService,
  createBoardService,
  deleteBoardService,
} from '../service/BoardService';

export async function getBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid board id' });
  }

  const board = await getBoardByIdRepo(id);
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }

  return res.json(board);
}

export async function createBoard(req: Request, res: Response) {
  console.log(req.body);
  const { name, description, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const board = await createBoardService(name, description, parentId);
    return res.status(201).json(board);
  } catch (err: any) {
    if (
      err.message === 'Parent board not found' ||
      err.message === 'Max board depth exceeded'
    ) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid board id' });
  }

  try {
    await deleteBoardService(id);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function changeParentBoard(req: Request, res: Response) {
  const boardId = Number(req.params.id);
  const { newParentId } = req.body;

  if (isNaN(boardId) || isNaN(newParentId)) {
    return res.status(400).json({ error: 'Invalid board id or new parent id' });
  }

  try {
    const updatedBoard = await changeBoardParentService(boardId, newParentId);
    return res.json(updatedBoard);
  } catch (err: any) {
    if (err.message === 'Board not found') {
      return res.status(404).json({ error: 'Board not found' });
    } else if (
      err.message === 'New parent board not found' ||
      err.message === 'A board cannot be its own parent' ||
      err.message === 'Max board depth exceeded'
    ) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
