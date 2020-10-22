import path from 'path';

import { serial as test } from 'ava';
import glob from 'fast-glob';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');
const { existsSync } = fsFixtures(fixturesDir);

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test('should copy when { source: "/source/*", destination: "/dest" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/*', destination: './testing/testing1' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing1');
  t.true(result);
  t.pass();
});

test('should copy when { source: "/source/**/*", destination: "/dest" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/**/*', destination: './testing/testing2' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing2');
  t.true(result);
  t.pass();
});

test('should copy and create destination directory { source: "/source", destination: "/dest/doesnt-exist-yet" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist', destination: './testing/testing3' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing3');
  t.true(result);
  t.pass();
});

test('should copy and create destination directory when { source: "/source/**/*.{html,js}", destination: "/dest/doesnt-exist-yet" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/**/*.{html,js}', destination: './testing/testing4' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const results = await glob('./testing/testing4/*', { cwd: fixturesDir });
  const allFilesExist = results.every((fileName) => fileName.endsWith('.html') || fileName.endsWith('.js'));
  t.true(allFilesExist);
  t.pass();
});

test('should copy and create destination directory when { source: "/source/{file1,file2}.js", destination: "/dest/doesnt-exist-yet" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/{fake,index}.html', destination: './testing/testing5' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing5/index.html');
  t.true(result);
  t.pass();
});

test('should copy when { source: "/sourceFile.js", destination: "/destFile.js" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [
        { source: './dist/index.html', destination: './testing/newindex.html' },
        { source: './dist/index.html', destination: './testing/sub/newindex.html' },
      ],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing/newindex.html'));
  t.true(existsSync('./testing/sub/newindex.html'));
  t.pass();
});

test('should first create destination if it does not exist and copy inside destination when { source: "/sourceFile.js", destination: "/destFolder" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/index.html', destination: './testing/testing6/' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing6/index.html');
  t.true(result);
  t.pass();
});

test('should not copy a file that does not exist { source: "/filedoesnotexist.js", destination: "/destFolder" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/doesnotexit.js', destination: './testing/wontexist.js' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/wontexist.js');
  t.false(result);
  t.pass();
});
