import { basename, join } from 'node:path';
import { existsSync } from 'node:fs';

import test from 'ava';
import del from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'multi-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should execute given actions in an event', async (t) => {
  const { tmpdir } = t.context;

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

  t.true(existsSync(join(tmpdir, dirName1)));
  t.true(existsSync(file));
  t.true(existsSync(join(tmpdir, destDir, 'file-copied')));
});
