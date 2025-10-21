import { Request, Response } from "express";
import { getBoardById } from "../repository/BoardRepository";
import { AppDataSource } from "../data-source";
import { Board } from "../entity/Board";
import { createBoardService, deleteBoardService } from "../service/BoardService";

export async function getBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid board id" });
  }

  const board = await getBoardById(id);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  return res.json(board);
}

export async function createBoard(req: Request, res: Response) {
  console.log(req.body)
  const { name, description, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const board = await createBoardService(name, description, parentId);
    return res.status(201).json(board);
  } catch (err: any) {
    if (err.message === "Parent board not found") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid board id" });
  }

  try {
    await deleteBoardService(id);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}