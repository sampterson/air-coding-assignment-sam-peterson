import { Request, Response } from "express";
import { getBoardById } from "../repository/BoardRepository";

export async function getBoard(req: Request, res: Response) {
  console.log("In getBoard");
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