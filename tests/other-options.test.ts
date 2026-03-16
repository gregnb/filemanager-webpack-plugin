import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin, { FileManagerPluginOptions } from '../src';

describe('Other Options', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test(`tasks in sequence with option 'runTasksInSeries'`, async ({ tmpdir }) => {
    const dir1 = tempy.getDirName('/');
    const dir2 = tempy.getDirName('/');

    const compiler = getCompiler();
    const compilerContext = compiler.options.context!;

    const config: FileManagerPluginOptions = {
      context: compilerContext,
      runTasksInSeries: true,
      events: {
        onEnd: {
          copy: [
            { source: 'dist/index.html', destination: join(tmpdir, dir1) },
            { source: join(tmpdir, dir1, 'index.html'), destination: join(tmpdir, dir2) },
          ],
        },
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dir1, 'index.html'))).toBe(true);
    expect(existsSync(join(tmpdir, dir2, 'index.html'))).toBe(true);
  });

  test(`resolve files from given 'context'`, async () => {
    const compiler = getCompiler();
    const distDir = join(compiler.options.context!, 'dist');

    const config = {
      events: {
        onEnd: {
          copy: [{ source: 'index.html', destination: 'index.copied.html' }],
        },
      },
      context: distDir,
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(distDir, 'index.html'))).toBe(true);
    expect(existsSync(join(distDir, 'index.copied.html'))).toBe(true);
  });
});
