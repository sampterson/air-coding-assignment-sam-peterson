export type Board = {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  children?: Board[]
};

export async function fetchBoards(): Promise<Board[]> {
  const res = await fetch("http://localhost:3001/board");
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchBoardById(id: number): Promise<Board | undefined> {
  const res = await fetch(`http://localhost:3001/board/${id}`);
  if (!res.ok) return undefined;
  return await res.json();
}

export async function createBoard(
  name: string,
  parentId?: number | null,
  description?: string
): Promise<Board | null> {
  const res = await fetch("http://localhost:3001/board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentId, description }),
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

export async function deleteBoard(id: number): Promise<boolean> {
  const res = await fetch(`http://localhost:3001/board/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function moveBoard(boardId: number, newParentId: number | null): Promise<boolean> {
  const res = await fetch(`http://localhost:3001/board/${boardId}/change-parent`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newParentId }),
  });
  return res.ok;
}