import { basename, join } from 'node:path';
import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin, { FileManagerPluginOptions } from '../src';

describe('Multi Actions', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('execute given actions in an event', async ({ tmpdir }) => {
    const dirName1 = tempy.getDirName();
    const destDir = tempy.getDirName();
    const file = await tempy.file(tmpdir, 'file');

    const config: FileManagerPluginOptions = {
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
