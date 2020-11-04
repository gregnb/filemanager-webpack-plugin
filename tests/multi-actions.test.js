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
        mkdir: ['testing-multiaction-dir'],
        copy: [{ source: 'dist/index.html', destination: 'testing-multiple-actions/index.copied.html' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-multiaction-dir'));
  t.true(existsSync('./testing-multiple-actions/index.copied.html'));
  t.pass();
});
