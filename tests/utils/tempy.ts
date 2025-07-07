import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

import getFixtruesDir from './getFixturesDir';

const fixturesDir = getFixtruesDir();

const getRandomId = (): string => crypto.randomBytes(16).toString('hex');
const getZipName = (ext = '.zip'): string => `test-${getRandomId()}${ext}`;
const getDirName = (last = ''): string => `dir-${getRandomId()}${last}`;
const getFileName = (last = ''): string => `file-${getRandomId()}${last}`;

interface DirOptions {
  root?: string;
  suffix?: string;
}

const dir = async ({ root = fixturesDir, suffix = 'random' }: DirOptions = {}): Promise<string> => {
  const tmpDir = await fs.promises.mkdtemp(path.join(root, `tmp-${suffix}-`));
  return tmpDir;
};

const file = async (dir: string, fileName = getFileName()): Promise<string> => {
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
