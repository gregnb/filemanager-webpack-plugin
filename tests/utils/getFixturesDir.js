import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getFixtruesDir = () => {
  return path.resolve(__dirname, '..', 'fixtures');
};

export default getFixtruesDir;
