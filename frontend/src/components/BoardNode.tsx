import React, { useEffect, useState } from 'react';
import { fetchBoardById, Board } from '../api/boardApi';

type BoardNodeProps = {
  node: Board;
  selectedId: number | null;
  onSelect: (id: number) => void;
  expandId?: number | null;
};

const BoardNode: React.FC<BoardNodeProps> = ({
  node,
  selectedId,
  onSelect,
  expandId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<Board[] | null>(
    node.children ?? null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expandId === node.id && !expanded) {
      setExpanded(true);
      if (children == null) {
        setLoading(true);
        fetchBoardById(node.id).then((boardWithChildren) => {
          setChildren(boardWithChildren?.children ?? []);
          setLoading(false);
        });
      }
    }
  }, [expandId, node.id, expanded, children]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expanded && children == null) {
      setLoading(true);
      const boardWithChildren = await fetchBoardById(node.id);
      setChildren(boardWithChildren?.children ?? []);
      setLoading(false);
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div>
      <div
        className={`cursor-pointer flex items-center py-1 rounded px-2 ${
          node.id === selectedId
            ? 'bg-blue-100 font-bold text-black'
            : 'hover:bg-gray-100 text-black'
        }`}
        onClick={() => onSelect(node.id)}
      >
        <button type="button" className="mr-1 text-xs" onClick={handleToggle}>
          {expanded ? '▼' : '▶'}
        </button>
        <span className="mr-2">📁</span>
        {node.name}
      </div>
      {expanded && (
        <div className="ml-6 border-l-2 border-gray-200 pl-2">
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : children && children.length > 0 ? (
            <ul>
              {children.map((child) => (
                <li key={child.id}>
                  <BoardNode
                    node={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    expandId={expandId}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm">No children</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardNode;
