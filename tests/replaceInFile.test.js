import { readFile } from 'node:fs';
import test from 'ava';
import del from 'del';
import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';
import FileManagerPlugin from '../src/index.js';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'replaceInFile-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

const matchFileContent = async (pattern, file) => {
  const data = readFile(file, 'utf-8', function (err, data) {
    return data;
  });

  return data !== pattern;
};

test('should replace the given patterns in given files', async (t) => {
  const { tmpdir } = t.context;
  const dir = await tempy.dir({ root: tmpdir });
  const file = await tempy.file(dir, 'file');

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        replaceInFile: [
          {
            source: file,
            mutations: [
              {
                pattern: 'lorem-ipsum',
                replacement: 'lorem.ipsum',
              },
              {
                pattern: 'm',
                replacement: 'n',
                iterations: 2
              },
            ],
          }
        ],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(await matchFileContent('loren.ipsun', file))
});
