import React, { useEffect, useState } from "react";
import {
  createBoard as apiCreateBoard,
  fetchBoards,
  deleteBoard as apiDeleteBoard,
  type Board as ApiBoard,
} from "../api/boardApi";
import FolderTreeView from "./FolderTreeView";

type Board = ApiBoard & { children?: Board[] };

function FolderTreeApp() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchBoards().then(setBoards);
  }, []);

  const buildTree = (items: Board[], parentId: number | null = null): Board[] =>
    items
      .filter((item) => (item.parentId ?? null) === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));

  const tree = buildTree(boards);

  const handleCreateBoard = async () => {
    const newBoard = await apiCreateBoard("New Folder", selectedId);
    if (!newBoard) return;
    // Optimistic add; alternatively refetch
    setBoards((prev) => [...prev, { ...newBoard, children: [] }]);
    setSelectedId(newBoard.id);
  };

  const handleDeleteBoard = async (id: number | null) => {
    if (id == null) return;
    const ok = await apiDeleteBoard(id);
    if (!ok) return;
    // Backend deletes node and descendants; refresh from server
    const fresh = await fetchBoards();
    setBoards(fresh);
    setSelectedId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col flex-shrink-0 max-h-screen">
        <h3 className="text-lg font-semibold mb-4">Folders</h3>
        <div className="flex-1 overflow-y-auto">
          <FolderTreeView nodes={tree} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="mt-4 flex flex-col gap-2 pb-8">
          <button
            className="bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
            onClick={handleCreateBoard}
          >
            New Folder
          </button>
          <button
            className="bg-red-500 text-white rounded px-3 py-1 hover:bg-red-600 disabled:opacity-50"
            onClick={() => handleDeleteBoard(selectedId)}
            disabled={selectedId === null}
          >
            Delete
          </button>
          <button
            className="bg-gray-500 text-white rounded px-3 py-1 hover:bg-gray-600 disabled:opacity-50"
            onClick={() => {
              // show move UI
            }}
            disabled={selectedId === null}
          >
            Move
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {selectedId ? (
          <div className="text-black">Selected Folder ID: {selectedId}</div>
        ) : (
          <div className="text-black">Select a folder to see details</div>
        )}
      </main>
    </div>
  );
}

export default FolderTreeApp;