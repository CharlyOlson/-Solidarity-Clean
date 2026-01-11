import React, { useState } from 'react';

// Dummy data for repository, branches, folders, and files
const repoData = {
  name: '-Solidarity-Clean',
  branches: [
    {
      name: 'main',
      folders: [
        {
          name: 'src',
          children: [
            { type: 'file', name: 'app.js' },
            { type: 'file', name: 'index.js' },
            { type: 'folder', name: 'components', children: [
              { type: 'file', name: 'HankoStamps.js' },
              { type: 'file', name: 'FileBrowser.js' }
            ]}
          ]
        },
        {
          name: 'public',
          children: [
            { type: 'file', name: 'index.html' }
          ]
        }
      ]
    },
    {
      name: 'to-benamed',
      folders: [
        {
          name: 'src',
          children: [
            { type: 'file', name: 'app.js' },
            { type: 'file', name: 'index.js' },
            { type: 'folder', name: 'components', children: [
              { type: 'file', name: 'HankoStamps.js' },
              { type: 'file', name: 'FileBrowser.js' }
            ]}
          ]
        }
      ]
    }
  ]
};

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

export default function RepoBrowser() {
  const [selectedBranch, setSelectedBranch] = useState(repoData.branches[0]);
  return (
    <div className="repo-browser">
      <h2>Repository: {repoData.name}</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Branch: </label>
        <select
          value={selectedBranch.name}
          onChange={e => setSelectedBranch(repoData.branches.find(b => b.name === e.target.value))}
        >
          {repoData.branches.map(branch => (
            <option key={branch.name} value={branch.name}>{branch.name}</option>
          ))}
        </select>
      </div>
      {selectedBranch.folders.map((folder, idx) => (
        <FileNode key={idx} node={{ ...folder, type: 'folder' }} />
      ))}
    </div>
  );
}
