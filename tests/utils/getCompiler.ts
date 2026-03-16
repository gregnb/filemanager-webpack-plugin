import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import webpack, { type Compiler } from 'webpack';
import HTMLPlugin from 'html-webpack-plugin';

import getFixtruesDir from './getFixturesDir';

const fixturesDir = getFixtruesDir();

const createIsolatedContext = (): string => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fmwp-'));
  fs.copyFileSync(path.join(fixturesDir, 'index.js'), path.join(tmpDir, 'index.js'));
  fs.copyFileSync(path.join(fixturesDir, 'index.html'), path.join(tmpDir, 'index.html'));
  return tmpDir;
};

const getCompiler = (context?: string): Compiler => {
  const contextDir = context || createIsolatedContext();

  const compiler = webpack({
    context: contextDir,
    mode: 'production',
    entry: path.resolve(contextDir),
    output: {
      path: path.resolve(contextDir, 'dist'),
      filename: 'js/bunlde-[contenthash].js',
      clean: true,
    },
    plugins: [new HTMLPlugin()],
  });

  return compiler;
};

export default getCompiler;
