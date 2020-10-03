import path from 'path';
import webpack from 'webpack';

const getCompiler = (context, outputFileName = 'bundle.js') => {
  const compiler = webpack({
    context,
    mode: 'production',
    entry: path.resolve(context),
    output: {
      path: path.resolve(context, 'dist'),
      filename: outputFileName,
    },
    plugins: [],
  });

  return compiler;
};

export default getCompiler;
