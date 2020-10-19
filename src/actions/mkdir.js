import fsExtra from 'fs-extra';

const mkdirAction = async (tasks) => {
  for (const task of tasks) {
    await fsExtra.ensureDir(task.absSource);
  }
};

export default mkdirAction;
