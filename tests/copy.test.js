import path from 'path';

import test from 'ava';
import glob from 'glob';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');
const { existsSync } = fsFixtures(fixturesDir);

const compiler = getCompiler(fixturesDir);
const hashedCompiler = getCompiler(fixturesDir, 'bundle-[hash].js');

test.serial('should copy when { source: "/source/*", destination: "/dest" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/*', destination: './testing/testing1' }],
    },
  };

  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing1');
  t.true(result);
  t.pass();
});

test.serial('should copy when { source: "/source/**/*", destination: "/dest" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/**/*', destination: './testing/testing2' }],
    },
  };

  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing2');
  t.true(result);
  t.pass();
});

test.serial(
  'should copy and create destination directory { source: "/source", destination: "/dest/doesnt-exist-yet" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist', destination: './testing/testing3' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/testing3');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should copy and create destination directory when { source: "/source/{file1,file2}.js", destination: "/dest/doesnt-exist-yet" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist/**/*.{html,js}', destination: './testing/testing4' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/testing4/bundle.js');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should copy and create destination directory when { source: "/source/**/*.{html,js}", destination: "/dest/doesnt-exist-yet" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist/{fake,bundle}.js', destination: './testing/testing5' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/testing5/bundle.js');
    t.true(result);
    t.pass();
  }
);

test.serial('should copy when { source: "/sourceFile.js", destination: "/destFile.js" } provided', async (t) => {
  const config = {
    onEnd: {
      copy: [{ source: './dist/bundle.js', destination: './testing/newfile.js' }],
    },
  };

  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/newfile.js');
  t.true(result);
  t.pass();
});

test.serial(
  'should first create destination if it does not exist and copy inside destination when { source: "/sourceFile.js", destination: "/destFolder" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist/bundle.js', destination: './testing/testing6' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/testing6/bundle.js');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should not copy a file that does not exist { source: "/filedoesnotexist.js", destination: "/destFolder" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist/doesnotexit.js', destination: './testing/wontexist.js' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const result = existsSync('./testing/wontexist.js');
    t.false(result);
    t.pass();
  }
);

test.serial(
  'should copy a [hash] file name to destination when { source: "/sourceFile-[hash].js", destination: "/destFolder" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist/bundle-[hash].js', destination: './testing/hashed-bundle.js' }],
      },
    };

    new FileManagerPlugin(config).apply(hashedCompiler);
    await compile(hashedCompiler);

    const result = existsSync('./testing/hashed-bundle.js');
    t.true(result);
    t.pass();
  }
);

test.serial(
  'should copy a file to hashed destination when { source: "/sourceFile.js", destination: "[hash]-destFile.js" } provided',
  async (t) => {
    const config = {
      onEnd: {
        copy: [{ source: './dist/bundle-[hash].js', destination: './testing/[hash]-hashbundlecheck.js' }],
      },
    };

    new FileManagerPlugin(config).apply(hashedCompiler);
    await compile(hashedCompiler);

    const result = glob.sync(path.resolve(fixturesDir, './testing/**/*-hashbundlecheck.js'));
    t.true(result.length > 0 ? true : false);
    t.pass();
  }
);
