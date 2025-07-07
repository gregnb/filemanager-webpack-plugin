import { basename, join } from 'node:path';
import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

describe('Multi Actions', () => {
  const test = baseTest.extend({
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('should execute given actions in an event', async ({ tmpdir }) => {
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
