import fs from 'fs';
import test from 'ava';
import path from 'path';
import webpack from 'webpack';
import delay from 'delay';
import options from './webpack.config.js';
import rimraf from 'rimraf';
import FileManagerPlugin from './lib';

test.before(async () => {
  console.log("running webpack build..");
  webpack(options, function(err, stats) {
    if (err) return done(err);
    if (stats.hasErrors()) return done(new Error(stats.toString()));
  });
  await delay(3000);
});

test.serial('should successfully copy when { source: "/source/*", destination: "/dest" } provided', t => {

  const result = fs.existsSync("./testing/testing1");
  t.true(result);
  t.pass();

});

test.serial('should successfully copy when { source: "/source/**/*", destination: "/dest" } provided', t => {

  const result = fs.existsSync("./testing/testing2");
  t.true(result);
  t.pass();

});

test.serial('should successfully copy and create destination directory { source: "/source", destination: "/dest/doesnt-exist-yet" } provided', t => {

  const result = fs.existsSync("./testing/testing3");
  t.true(result);
  t.pass();

});

test.serial('should successfully copy and create destination directory when { source: "/source/{file1,file2}.js", destination: "/dest/doesnt-exist-yet" } provided', t => {

  const result = fs.existsSync("./testing/testing4/bundle.js");
  t.true(result);
  t.pass();

});

test.serial('should successfully copy and create destination directory when { source: "/source/**/*.{html,js}", destination: "/dest/doesnt-exist-yet" } provided', t => {

  const result = fs.existsSync("./testing/testing5/bundle.js");
  t.true(result);
  t.pass();

});

test.serial('should successfully copy when { source: "/sourceFile.js", destination: "/destFile.js" } provided', t => {

  const result = fs.existsSync("./testing/newfile.js");
  t.true(result);
  t.pass();

});

test.serial('should successfully first create destination if it does not exist and copy inside destination when { source: "/sourceFile.js", destination: "/destFolder" } provided', t => {

  const result = fs.existsSync("./testing/testing6/bundle.js");
  t.true(result);
  t.pass();

});

test.serial('should successfully copy a [hash] file name to destination when { source: "/sourceFile-[hash].js", destination: "/destFolder" } provided', t => {

  const result = fs.existsSync("./testing/hashed-bundle.js");
  t.true(result);
  t.pass();

});

test.serial('should fail webpack build when string provided in delete function instead of array', async t => {

  const baseConfig = getBasePlainConfig();
  const configWithStringInDelete = Object.assign(baseConfig, {
    plugins: [
      new FileManagerPlugin({
        onStart: {
          delete: "string instead of array",
        }
      })
    ]
  });

  webpack(configWithStringInDelete, function (err, stats) {
    if (err || stats.hasErrors()) t.pass();
    else t.fail();
  });

  await delay(1000);

});

function getBasePlainConfig() {

  return {
    entry: path.resolve(__dirname, 'example/index.js'),
    stats: "verbose",
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        { test: /\.css$/, loader: 'style!css' }
      ]
    }
  };

}