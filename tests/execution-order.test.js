import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { beforeEach, afterEach, test, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

describe('Execution Order', () => {
  let tmpdir;

  beforeEach(async () => {
    tmpdir = await tempy.dir({ suffix: 'execution-order' });
  });

  afterEach(async () => {
    await deleteAsync(tmpdir);
  });

  test('should execute actions in a given order', async () => {
    const mDir = await tempy.dir({ root: tmpdir });
    await tempy.file(mDir, 'file');

    const dirName = relative(tmpdir, mDir);

    const config = {
      context: tmpdir,
      events: {
        onStart: [
          {
            mkdir: ['dir1', 'dir2'],
          },
          {
            delete: ['dir2'],
          },
          {
            copy: [{ source: `${dirName}/`, destination: 'dir-copied/' }],
          },
        ],
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, 'dir1'))).toBe(true);
    expect(existsSync(join(tmpdir, 'dir2'))).toBe(false);
    expect(existsSync(join(tmpdir, 'dir2'))).toBe(false);
    expect(existsSync(join(tmpdir, 'dir-copied/file'))).toBe(true);
  });
});
