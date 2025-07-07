import { join, relative, basename } from 'node:path';
import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

describe('Move Action', () => {
  const test = baseTest.extend({
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('should move files from source to destination', async ({ tmpdir }) => {
    const dir = await tempy.dir({ root: tmpdir });
    const file = await tempy.file(dir, 'file');

    const srcDir = relative(tmpdir, dir);
    const destDir = tempy.getDirName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          move: [{ source: srcDir, destination: destDir }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, srcDir))).toBe(false);
    expect(existsSync(join(tmpdir, destDir))).toBe(true);
    expect(existsSync(join(tmpdir, destDir, basename(file)))).toBe(true);
  });
});
