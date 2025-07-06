import { existsSync } from 'node:fs';

import { beforeEach, afterEach, test, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

describe('Delete Action', () => {
  let tmpdir;

  beforeEach(async () => {
    tmpdir = await tempy.dir({ suffix: 'delete-action' });
  });

  afterEach(async () => {
    await deleteAsync(tmpdir);
  });

  test('should delete file when array of strings provided in delete function', async () => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const file3 = await tempy.file(tmpdir);

    expect(existsSync(file1)).toBe(true);
    expect(existsSync(file2)).toBe(true);
    expect(existsSync(file3)).toBe(true);

    const config = {
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

  test('should support glob', async () => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const file3 = await tempy.file(tmpdir);

    expect(existsSync(file1)).toBe(true);
    expect(existsSync(file2)).toBe(true);
    expect(existsSync(file3)).toBe(true);

    const config = {
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

  test('should accept options', async () => {
    const file = await tempy.file(tmpdir);

    expect(existsSync(file)).toBe(true);

    const config = {
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
