import path from 'path';
import webpack from 'webpack';
import HTMLPlugin from 'html-webpack-plugin';

import getFixtruesDir from './getFixturesDir';

const fixturesDir = getFixtruesDir();

const webpack5Options = {
  clean: true,
};

const isWebpack5 = typeof webpack.version === 'string' ? parseInt(webpack.version) === 5 : false;

const getCompiler = () => {
  const compiler = webpack({
    context: fixturesDir,
    mode: 'production',
    entry: path.resolve(fixturesDir),
    output: {
      path: path.resolve(fixturesDir, 'dist'),
      filename: 'js/bunlde-[contenthash].js',
      ...(isWebpack5 ? webpack5Options : {}),
    },
    plugins: [new HTMLPlugin()],
  });

  return compiler;
};

export default getCompiler;
