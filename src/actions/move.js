import fsExtra from 'fs-extra';

const moveAction = async (input) => {
  for (const task of input) {
    await fsExtra.move(task.absSource, task.absDestination);
  }
};

export default moveAction;
