import fs from 'fs';
import path from 'path';

const fsFixtures = (root) => {
  const resolve = (p) => {
    return path.resolve(root, p);
  };

  const mkdir = (p) => {
    if (existsSync(p)) {
      return;
    }
    return fs.promises.mkdir(resolve(p));
  };

  const writeFile = (p, content = '') => {
    return fs.promises.writeFile(resolve(p), content);
  };

  const readFile = (p) => {
    return fs.promises.readFile(resolve(p));
  };

  const existsSync = (p) => {
    return fs.existsSync(resolve(p));
  };

  return {
    mkdir,
    writeFile,
    readFile,
    existsSync,
  };
};

export default fsFixtures;
