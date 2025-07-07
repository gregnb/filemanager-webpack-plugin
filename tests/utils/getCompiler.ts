import path from 'node:path';
import webpack, { type Compiler } from 'webpack';
import HTMLPlugin from 'html-webpack-plugin';

import getFixtruesDir from './getFixturesDir';

const fixturesDir = getFixtruesDir();

const getCompiler = (context?: string): Compiler => {
  const contextDir = context || fixturesDir;

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
