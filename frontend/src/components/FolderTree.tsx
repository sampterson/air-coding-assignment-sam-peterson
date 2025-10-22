import React, { useEffect, useState } from 'react';
import {
  createBoard as apiCreateBoard,
  fetchBoards,
  deleteBoard as apiDeleteBoard,
  Board,
  fetchBoardById,
} from '../api/boardApi';
import NewFolderModal from './NewFolderModal';
import FolderNode from './FolderNode';

function FolderTree() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  useEffect(() => {
    fetchBoards().then(setBoards);
  }, []);

  const rootNodes = boards.filter((b) => !b.parentId);

  const handleCreateBoard = async (name: string, description: string) => {
    const newBoard = await apiCreateBoard(name, selectedId, description);
    if (!newBoard) return;

    if (selectedId) {
      const updatedParent = await fetchBoardById(selectedId);
      setBoards((prev) => [
        ...prev.filter((b) => b.id !== selectedId),
        ...(updatedParent ? [updatedParent] : []),
      ]);
      setSelectedId(selectedId);
    } else {
      setBoards((prev) => [...prev, { ...newBoard, children: [] }]);
      setSelectedId(newBoard.id);
    }
    setShowNewFolderModal(false);
  };

  const handleDeleteBoard = async (id: number | null) => {
    if (id == null) return;
    const ok = await apiDeleteBoard(id);
    if (!ok) return;
    const fresh = await fetchBoards();
    setBoards(fresh);
    setSelectedId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col flex-shrink-0 max-h-screen">
        <h3 className="text-lg font-semibold mb-4">Folders</h3>
        <div className="flex-1 overflow-y-auto">
          <ul className="pl-0">
            {rootNodes.map((node) => (
              <li key={node.id}>
                <FolderNode
                  node={node}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  expandId={selectedId}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-col gap-2 pb-8">
          <button
            className="bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
            onClick={() => setShowNewFolderModal(true)}
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
        <NewFolderModal
          open={showNewFolderModal}
          onClose={() => setShowNewFolderModal(false)}
          onCreate={handleCreateBoard}
        />
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

export default FolderTree;
