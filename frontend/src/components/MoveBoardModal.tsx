import React, { useState } from "react";
import { Board } from "../api/boardApi";

type MoveBoardModalProps = {
  open: boolean;
  onClose: () => void;
  onMove: (newParentId: number | null) => void;
  boards: Board[];
  currentId: number | null;
};

const MoveBoardModal: React.FC<MoveBoardModalProps> = ({
  open,
  onClose,
  onMove,
  boards,
  currentId,
}) => {
  const [selectedParent, setSelectedParent] = useState<number | null>(null);

  if (!open) return null;

  // Exclude current board and its descendants from possible parents
  const filterBoards = (boards: Board[], excludeId: number | null): Board[] =>
    boards.filter((b) => b.id !== excludeId);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded shadow-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">Move Board</h2>
        <select
          className="w-full border border-gray-300 rounded px-2 py-1 mb-4"
          value={selectedParent ?? ""}
          onChange={e =>
            setSelectedParent(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Root (no parent)</option>
          {filterBoards(boards, currentId).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => onMove(selectedParent)}
            disabled={currentId === null}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveBoardModal;