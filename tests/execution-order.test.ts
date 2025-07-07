import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../src';

describe('Execution Order', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('should execute actions in a given order', async ({ tmpdir }) => {
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
