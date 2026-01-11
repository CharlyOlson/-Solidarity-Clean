import React, { useState } from 'react';

// Dummy file/folder structure for scaffolding
const fileTree = [
  {
    type: 'folder',
    name: 'src',
    children: [
      { type: 'file', name: 'app.js' },
      { type: 'file', name: 'index.js' },
      { type: 'folder', name: 'components', children: [
        { type: 'file', name: 'HankoStamps.js' }
      ]}
    ]
  },
  {
    type: 'folder',
    name: 'public',
    children: [
      { type: 'file', name: 'index.html' }
    ]
  }
];

function FileNode({ node }) {
  const [open, setOpen] = useState(false);
  if (node.type === 'folder') {
    return (
      <div className="file-node folder">
        <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          {open ? '📂' : '📁'} {node.name}
        </div>
        {open && (
          <div style={{ paddingLeft: 16 }}>
            {node.children && node.children.map((child, idx) => (
              <FileNode key={idx} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  }
  return <div className="file-node file">📄 {node.name}</div>;
}

export default function FileBrowser() {
  return (
    <div className="file-browser">
      <h2>File/Folder Navigation</h2>
      {fileTree.map((node, idx) => (
        <FileNode key={idx} node={node} />
      ))}
    </div>
  );
}
