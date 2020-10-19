import del from 'del';

const deleteAction = async (tasks) => {
  for (const task of tasks) {
    await del(task.absSource);
  }
};

export default deleteAction;
