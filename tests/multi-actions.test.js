import { basename, join } from 'node:path';
import { existsSync } from 'node:fs';

import { beforeEach, afterEach, test, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

describe('Multi Actions', () => {
  let tmpdir;

  beforeEach(async () => {
    tmpdir = await tempy.dir({ suffix: 'multi-action' });
  });

  afterEach(async () => {
    await deleteAsync(tmpdir);
  });

  test('should execute given actions in an event', async () => {
    const dirName1 = tempy.getDirName();
    const destDir = tempy.getDirName();
    const file = await tempy.file(tmpdir, 'file');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          mkdir: [dirName1],
          copy: [{ source: basename(file), destination: `${destDir}/file-copied` }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dirName1))).toBe(true);
    expect(existsSync(file)).toBe(true);
    expect(existsSync(join(tmpdir, destDir, 'file-copied'))).toBe(true);
  });
});
