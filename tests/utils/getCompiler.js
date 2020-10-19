import path from 'path';
import webpack from 'webpack';
import HTMLPlugin from 'html-webpack-plugin';

const getCompiler = (context) => {
  const compiler = webpack({
    context,
    mode: 'production',
    entry: path.resolve(context),
    output: {
      path: path.resolve(context, 'dist'),
      filename: 'js/bunlde-[contenthash].js',
    },
    plugins: [new HTMLPlugin()],
  });

  return compiler;
};

export default getCompiler;
