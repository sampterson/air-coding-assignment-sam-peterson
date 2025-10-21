import React from "react";

export type TreeNode = {
  id: number;
  name: string;
  children?: TreeNode[];
};

type FolderTreeViewProps = {
  nodes: TreeNode[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function FolderTreeView({ nodes, selectedId, onSelect }: FolderTreeViewProps) {
  return (
    <ul className="pl-4">
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className={`cursor-pointer flex items-center py-1 rounded px-2 ${
              node.id === selectedId ? "bg-blue-100 font-bold text-black" : "hover:bg-gray-100 text-black"
            }`}
            onClick={() => onSelect(node.id)}
          >
            <span className="mr-2">📁</span>
            {node.name}
          </div>
          {node.children && node.children.length > 0 && (
            <FolderTreeView nodes={node.children} selectedId={selectedId} onSelect={onSelect} />
          )}
        </li>
      ))}
    </ul>
  );
}