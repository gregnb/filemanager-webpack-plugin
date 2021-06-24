import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

import getFixtruesDir from './getFixturesDir.js';

const fixturesDir = getFixtruesDir();

const getRandomId = () => crypto.randomBytes(16).toString('hex');
const getZipName = (ext = '.zip') => `test-${getRandomId()}${ext}`;
const getDirName = (last = '') => `dir-${getRandomId()}${last}`;
const getFileName = (last = '') => `file-${getRandomId()}${last}`;

const dir = async ({ root = fixturesDir, suffix = 'random' }) => {
  const tmpDir = await fs.promises.mkdtemp(path.join(root, `tmp-${suffix}-`));
  return tmpDir;
};

const file = async (dir, fileName = getFileName()) => {
  const filePath = path.join(dir, fileName);
  await fs.promises.writeFile(filePath, 'lorem-ipsum', 'utf-8');
  return filePath;
};

export default {
  dir,
  file,
  getRandomId,
  getZipName,
  getDirName,
  getFileName,
};
