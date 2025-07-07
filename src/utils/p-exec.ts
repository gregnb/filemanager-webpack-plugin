const defaultTask = async (): Promise<void> => {};

const pExec = async <T>(
  series: boolean = false,
  arr: T[] = [],
  task: (item: T) => Promise<void> = defaultTask
): Promise<void> => {
  if (series) {
    await arr.reduce(async (p, spec) => {
      await p;
      return task(spec);
    }, Promise.resolve(null));
    return;
  }

  const pMap = arr.map(task);
  await Promise.all(pMap);
};

export default pExec;
