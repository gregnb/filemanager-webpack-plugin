import { existsSync } from 'node:fs';
import { basename, join, sep } from 'node:path';

import test from 'ava';
import del from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'copy-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should copy files to a directory given a glob source', async (t) => {
  const { tmpdir } = t.context;

  const file1 = await tempy.file(tmpdir);
  const file2 = await tempy.file(tmpdir);
  const dirName = tempy.getDirName();

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: '*', destination: dirName }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, dirName)));
  t.true(existsSync(join(tmpdir, dirName, basename(file1))));
  t.true(existsSync(join(tmpdir, dirName, basename(file2))));
});

test('should copy files to a directory given a glob absolute source', async (t) => {
  const { tmpdir } = t.context;

  const file1 = await tempy.file(tmpdir);
  const file2 = await tempy.file(tmpdir);
  const dirName = tempy.getDirName();

  const source = join(tmpdir, '*');

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source, destination: dirName }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, dirName)));
  t.true(existsSync(join(tmpdir, dirName, basename(file1))));
  t.true(existsSync(join(tmpdir, dirName, basename(file2))));
});

test('should deep copy files to directory given a glob source', async (t) => {
  const { tmpdir } = t.context;

  const file1 = await tempy.file(tmpdir);
  const nestedDir = await tempy.dir({ root: tmpdir });
  const file2 = await tempy.file(nestedDir);

  const dirName = tempy.getDirName();

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: '**/*', destination: dirName }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, dirName)));
  t.true(existsSync(join(tmpdir, dirName, basename(file1))));
  t.true(existsSync(join(tmpdir, dirName, nestedDir.split(sep).pop(), basename(file2))));
});

test('should flat copy the files to directory given a glob source', async (t) => {
  const { tmpdir } = t.context;

  const file1 = await tempy.file(tmpdir);
  const nestedDir = await tempy.dir({ root: tmpdir });
  const file2 = await tempy.file(nestedDir);

  const dirName = tempy.getDirName();

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [
          {
            source: '**/*',
            destination: dirName,
            options: {
              flat: true,
            },
            globOptions: {},
          },
        ],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, dirName)));
  t.true(existsSync(join(tmpdir, dirName, basename(file1))));
  t.true(existsSync(join(tmpdir, dirName, basename(file2))));
});

test(`should create destination directory if it doesn't exist and copy files`, async (t) => {
  const { tmpdir } = t.context;

  const file = await tempy.file(tmpdir);
  const destDir = tempy.getDirName();

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: '*', destination: destDir }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, destDir, basename(file))));
});

test('should copy and create destination directory given a glob source with extension', async (t) => {
  const { tmpdir } = t.context;

  await tempy.file(tmpdir, 'index.html');
  const destDir = tempy.getDirName();

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: `**/*{fake,index}.html`, destination: destDir }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, destDir, 'index.html')));
  t.false(existsSync(join(tmpdir, destDir, 'fake')));
});

test('should copy source file to destination file', async (t) => {
  const { tmpdir } = t.context;

  await tempy.file(tmpdir, 'index.html');

  const config = {
    context: tmpdir,
    runTasksInSeries: true,
    events: {
      onEnd: {
        copy: [
          { source: 'index.html', destination: './deep/index.html' },
          { source: 'index.html', destination: './deep/deep1/index.html' },
        ],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, 'deep/index.html')));
  t.true(existsSync(join(tmpdir, 'deep/deep1/index.html')));
});

test('should copy file into the directory given source is a file and destination is a directory', async (t) => {
  const { tmpdir } = t.context;

  const fileName = tempy.getFileName();
  await tempy.file(tmpdir, fileName);
  const destDir = tempy.getDirName('/');

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: fileName, destination: destDir }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, destDir, fileName)));
});

test('should copy a file without extension to target folder', async (t) => {
  const { tmpdir } = t.context;

  const fileName = tempy.getFileName();
  await tempy.file(tmpdir, fileName);
  const destDir = tempy.getDirName('/');

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: fileName, destination: destDir }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, destDir, fileName)));
});

test('should not copy a file that does not exist', async (t) => {
  const { tmpdir } = t.context;

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        copy: [{ source: 'doesnotexit.js', destination: 'wontexist.js' }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.false(existsSync('./testing/wontexist.js'));
});
