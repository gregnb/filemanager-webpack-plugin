import fs from 'fs';
import test from 'ava';
import path from 'path';
import webpack from 'webpack';
import delay from 'delay';
import options from './webpack.config.js';
import rimraf from 'rimraf';

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

test.serial('should successfully copy when { source: "/sourceFile.js", destination: "/destFolder" } provided', t => {

  const result = fs.existsSync("./testing/bundle.js");
  t.true(result);
  t.pass();

});


