import path from 'path';

const getFixtruesDir = () => {
  return path.resolve(__dirname, '..', 'fixtures');
};

export default getFixtruesDir;
