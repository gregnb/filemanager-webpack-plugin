import { existsSync } from 'node:fs';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin, { FileManagerPluginOptions } from '../src';

describe('Delete Action', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('delete file when array of strings provided in delete function', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const file3 = await tempy.file(tmpdir);

    expect(existsSync(file1)).toBe(true);
    expect(existsSync(file2)).toBe(true);
    expect(existsSync(file3)).toBe(true);

    const config: FileManagerPluginOptions = {
      context: tmpdir,
      events: {
        onStart: {
          delete: [file1],
        },
        onEnd: {
          delete: [file2, file3],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(file1)).toBe(false);
    expect(existsSync(file2)).toBe(false);
    expect(existsSync(file3)).toBe(false);
  });

  test('support glob', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const file3 = await tempy.file(tmpdir);

    expect(existsSync(file1)).toBe(true);
    expect(existsSync(file2)).toBe(true);
    expect(existsSync(file3)).toBe(true);

    const config: FileManagerPluginOptions = {
      context: tmpdir,
      events: {
        onEnd: {
          delete: ['./*'],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);

    await compile(compiler);

    expect(existsSync(file1)).toBe(false);
    expect(existsSync(file2)).toBe(false);
    expect(existsSync(file3)).toBe(false);
  });

  test('accept options', async ({ tmpdir }) => {
    const file = await tempy.file(tmpdir);

    expect(existsSync(file)).toBe(true);

    const config: FileManagerPluginOptions = {
      context: tmpdir,
      events: {
        onEnd: {
          delete: [{ source: './*', options: { force: true } }, './*'],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);

    await compile(compiler);

    expect(existsSync(file)).toBe(false);
  });
});
