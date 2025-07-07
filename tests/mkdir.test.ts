import { join, relative } from 'node:path';
import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../src';

describe('Mkdir Action', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('should create the given directories', async ({ tmpdir }) => {
    const config = {
      context: tmpdir,
      events: {
        onStart: {
          mkdir: ['dir1', 'dir2'],
        },
        onEnd: {
          mkdir: ['dir3', 'dir4'],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, 'dir1'))).toBe(true);
    expect(existsSync(join(tmpdir, 'dir2'))).toBe(true);
    expect(existsSync(join(tmpdir, 'dir3'))).toBe(true);
    expect(existsSync(join(tmpdir, 'dir4'))).toBe(true);
  });

  test('should create nested directories', async ({ tmpdir }) => {
    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          mkdir: ['dir/depth1', 'dir/depth1/depth2'],
        },
      },
      runTasksInSeries: true,
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, 'dir'))).toBe(true);
    expect(existsSync(join(tmpdir, 'dir/depth1'))).toBe(true);
    expect(existsSync(join(tmpdir, 'dir/depth1/depth2'))).toBe(true);
  });

  test('should not overwite existing directories', async ({ tmpdir }) => {
    const dir = await tempy.dir({ root: tmpdir });
    const file = await tempy.file(dir, 'file');
    const dirName = relative(tmpdir, dir);

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          mkdir: [dirName],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(dir)).toBe(true);
    expect(existsSync(join(file))).toBe(true);
  });
});
