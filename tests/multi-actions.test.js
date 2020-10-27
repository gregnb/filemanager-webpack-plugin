import path from 'path';

import { serial as test } from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, mkdir, writeFile } = fsFixtures(fixturesDir);

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test('should execute given actions in an event', async (t) => {
  await mkdir('testing-multiple-actions');
  await writeFile('testing-multiple-actions/index.html');

  const config = {
    events: {
      onEnd: {
        copy: [{ source: 'dist/index.html', destination: 'testing-multiple-actions/index.copied.html' }],
        move: [{ source: 'testing-multiple-actions/', destination: 'testing-multi-action-dir1/' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-multiple-actions/index.copied.html'));
  t.true(existsSync('./testing-multi-action-dir1/index.html'));
  t.pass();
});
