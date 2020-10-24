import fs from 'fs';

const mkdirAction = async (tasks) => {
  for (const task of tasks) {
    await fs.promises.mkdir(task.absoluteSource, { recursive: true });
  }
};

export default mkdirAction;
