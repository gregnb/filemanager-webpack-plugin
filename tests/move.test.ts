import { join, relative, basename } from 'node:path';
import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin, { FileManagerPluginOptions } from '../src';

describe('Move Action', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('move files from source to destination', async ({ tmpdir }) => {
    const dir = await tempy.dir({ root: tmpdir });
    const file = await tempy.file(dir, 'file');

    const srcDir = relative(tmpdir, dir);
    const destDir = tempy.getDirName();

    const config: FileManagerPluginOptions = {
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
