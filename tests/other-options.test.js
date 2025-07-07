import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import getFixtruesDir from './utils/getFixturesDir.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

const fixturesDir = getFixtruesDir();

describe('Other Options', () => {
  const test = baseTest.extend({
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test(`should tasks in sequence with option 'runTasksInSeries'`, async ({ tmpdir }) => {
    const dir1 = tempy.getDirName('/');
    const dir2 = tempy.getDirName('/');

    const config = {
      context: fixturesDir,
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

    const compiler = getCompiler(fixturesDir);
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dir1, 'index.html'))).toBe(true);
    expect(existsSync(join(tmpdir, dir2, 'index.html'))).toBe(true);
  });

  test(`should resolve files from given 'context'`, async ({ tmpdir }) => {
    const distDir = join(fixturesDir, 'dist');

    const config = {
      events: {
        onEnd: {
          copy: [{ source: 'index.html', destination: 'index.copied.html' }],
        },
      },
      context: distDir,
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(distDir, 'index.html'))).toBe(true);
    expect(existsSync(join(distDir, 'index.copied.html'))).toBe(true);
  });
});
