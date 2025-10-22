import React, { useEffect, useState } from 'react';
import {
  createBoard as apiCreateBoard,
  fetchBoards,
  deleteBoard as apiDeleteBoard,
  Board,
  fetchBoardById,
  moveBoard,
} from '../api/boardApi';
import NewBoardModal from './NewBoardModal';
import BoardNode from './BoardNode';
import MoveBoardModal from './MoveBoardModal';

// TODO: Move the entire board tree state into a shared memory store (such as Redux or react-query).
// Would provide a single source of truth for the folder/board hierarchy, making it easier to:
// - Keep all UI components in sync with the latest tree structure
// - Efficiently update, move, or delete nodes anywhere in the tree
// - Support advanced features like drag-and-drop, undo/redo, and optimistic updates
// - Avoid redundant API calls and unnecessary re-renders
// First attempt used only react state per each component, having a shared state would make things
// like moving boards to new parents easier, since currently only the parent nodes are stored in state here
// and are available to move to

function BoardTree() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  useEffect(() => {
    fetchBoards().then(setBoards);
  }, []);

  useEffect(() => {
    if (selectedId !== null) {
      fetchBoardById(selectedId);
    }
  }, [selectedId]);

  const rootNodes = boards.filter((b) => !b.parentId);

  const handleCreateBoard = async (name: string, description: string) => {
    const newBoard = await apiCreateBoard(name, selectedId, description);
    if (!newBoard) return;

    // TODO: Reloading all boards to properly show state:
    const fresh = await fetchBoards();
    setBoards(fresh);
    setSelectedId(null);

    // TODO: Desired behavior, rerender parent of created board only
    // if (selectedId) {
    //   // Fetch the updated parent with its new children
    //   const updatedParent = await fetchBoardById(selectedId);
    //   setBoards((prev) => [
    //     ...prev.filter((b) => b.id !== selectedId),
    //     ...(updatedParent ? [updatedParent] : []),
    //   ]);
    //   setSelectedId(selectedId); // This will trigger expand in BoardNode
    // } else {
    //   // New root folder
    //   setBoards((prev) => [...prev, { ...newBoard, children: [] }]);
    //   setSelectedId(newBoard.id);
    // }
    setShowNewBoardModal(false);
  };

  const handleDeleteBoard = async (id: number | null) => {
    if (id == null) return;
    const ok = await apiDeleteBoard(id);
    if (!ok) return;
    const fresh = await fetchBoards();
    setBoards(fresh);
    setSelectedId(null);
  };

  const handleMoveBoard = async (newParentId: number | null) => {
    if (selectedId == null) return;
    await moveBoard(selectedId, newParentId);
    const fresh = await fetchBoards();
    setBoards(fresh);
    setShowMoveModal(false);
    setSelectedId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col flex-shrink-0 max-h-screen">
        <h3 className="text-lg font-semibold mb-4">Boards</h3>
        <div className="flex-1 overflow-y-auto">
          <ul className="pl-0">
            {rootNodes.map((node) => (
              <li key={node.id}>
                <BoardNode
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
            onClick={() => setShowNewBoardModal(true)}
          >
            New Board
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
            onClick={() => setShowMoveModal(true)}
            disabled={selectedId === null}
          >
            Move
          </button>
        </div>
        <NewBoardModal
          open={showNewBoardModal}
          onClose={() => setShowNewBoardModal(false)}
          onCreate={handleCreateBoard}
        />
        <MoveBoardModal
          open={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          onMove={handleMoveBoard}
          boards={boards}
          currentId={selectedId}
        />
      </aside>
      <main className="flex-1 p-8">
        {selectedId ? (
          <div className="text-black">Selected Board ID: {selectedId}</div>
        ) : (
          <div className="text-black">Select a folder to see details</div>
        )}
      </main>
    </div>
  );
}

export default BoardTree;
