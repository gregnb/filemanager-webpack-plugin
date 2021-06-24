import path from 'node:path';
import webpack from 'webpack';
import HTMLPlugin from 'html-webpack-plugin';

import getFixtruesDir from './getFixturesDir.js';

const fixturesDir = getFixtruesDir();

const getCompiler = () => {
  const compiler = webpack({
    context: fixturesDir,
    mode: 'production',
    entry: path.resolve(fixturesDir),
    output: {
      path: path.resolve(fixturesDir, 'dist'),
      filename: 'js/bunlde-[contenthash].js',
      clean: true,
    },
    plugins: [new HTMLPlugin()],
  });

  return compiler;
};

export default getCompiler;
