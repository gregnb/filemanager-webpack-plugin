import fs from 'fs';
import path from 'path';

import test from 'ava';
import JSZip from 'jszip';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, readFile, writeFile } = fsFixtures(fixturesDir);
const compiler = getCompiler(fixturesDir);

test.serial(
  'should archive (ZIP) a directory to destination ZIP when { source: "/source", destination: "/dest.zip" } provided',
  async (t) => {
    const config = {
      onEnd: {
        archive: [{ source: './dist', destination: './testing/test1.zip' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/test1.zip');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should archive (ZIP) a single file to destination ZIP when { source: "/sourceFile.js", destination: "/dest.zip" } provided',
  async (t) => {
    const config = {
      onEnd: {
        archive: [{ source: './dist/bundle.js', destination: './testing/test2.zip' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/test2.zip');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should archive (ZIP) a directory glob to destination ZIP when { source: "/source/**/*", destination: "/dest.zip" } provided',
  async (t) => {
    const config = {
      onEnd: {
        archive: [{ source: './dist/**/*', destination: './testing/test3.zip' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/test3.zip');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should archive (TAR) a directory glob to destination TAR when { source: "/source/**/*", destination: "/dest.zip", format: "tar" } provided',
  async (t) => {
    const config = {
      onEnd: {
        archive: [{ source: './dist/**/*', destination: './testing/test4.tar', format: 'tar' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/test4.tar');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should archive (TAR.GZ) a directory glob to destination TAR.GZ when { source: "/source/**/*", destination: "/dest.tar.gz", format: "tar" } provided',
  async (t) => {
    const config = {
      onEnd: {
        archive: [
          {
            source: './dist/**/*',
            destination: './testing/test5.tar.gz',
            format: 'tar',
            options: {
              gzip: true,
              gzipOptions: {
                level: 1,
              },
            },
          },
        ],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/test5.tar.gz');
    t.true(result);
    t.pass();
  }
);

// https://github.com/gregnb/filemanager-webpack-plugin/issues/37
test.serial(
  'should exclude archive (ZIP) from destination ZIP when { source: "/source", destination: "/source/dest.zip" } provided',
  async (t) => {
    const config = {
      onEnd: {
        archive: [{ source: './testing/', destination: './testing/test7.zip' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    async function getResult() {
      const data = await readFile('./testing/test7.zip');
      const zip = await JSZip.loadAsync(data);
      return !Object.keys(zip.files).includes('test7.zip');
    }

    const result = await getResult();
    t.true(result);
  }
);

test.serial(
  'should include root-level files in the archive (ZIP) from destination ZIP when { source: "/source", destination: "/source/dest.zip" } provided',
  async (t) => {
    await writeFile('testing/random-file.js', '');

    const config = {
      onEnd: {
        archive: [{ source: './testing/', destination: './testing/test7.zip' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    async function getResult() {
      const data = await readFile('./testing/test7.zip');
      const zip = await JSZip.loadAsync(data);
      return Object.keys(zip.files).includes('random-file.js');
    }

    const result = await getResult();
    t.true(result);
  }
);
