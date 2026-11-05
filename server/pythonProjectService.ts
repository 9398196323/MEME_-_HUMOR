import fs from 'fs';
import path from 'path';

const PROJECT_DIR = path.join(process.cwd(), 'python_flask_project');

export interface ProjectFileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  children?: ProjectFileNode[];
}

function buildTree(currentPath: string, relativePath: string = ''): ProjectFileNode[] {
  if (!fs.existsSync(currentPath)) return [];
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const nodes: ProjectFileNode[] = [];

  for (const entry of entries) {
    if (entry.name === '__pycache__' || entry.name === '.pytest_cache' || entry.name.endsWith('.db')) {
      continue;
    }
    const fullEntryPath = path.join(currentPath, entry.name);
    const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      nodes.push({
        path: rel,
        name: entry.name,
        type: 'directory',
        children: buildTree(fullEntryPath, rel)
      });
    } else {
      const stat = fs.statSync(fullEntryPath);
      nodes.push({
        path: rel,
        name: entry.name,
        type: 'file',
        size: stat.size
      });
    }
  }

  // Sort directories first, then files
  return nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

export const PythonProjectService = {
  getTree(): ProjectFileNode[] {
    return buildTree(PROJECT_DIR);
  },

  getFileContent(relativeFilePath: string): string | null {
    // Sanitize to prevent path traversal
    const safePath = path.normalize(relativeFilePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(PROJECT_DIR, safePath);

    if (!fullPath.startsWith(PROJECT_DIR)) {
      return null;
    }

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
    return null;
  }
};
