const defaultTask = async () => {};

const pExec = async (series = false, arr = [], task = defaultTask) => {
  if (series) {
    await arr.reduce(async (p, spec) => {
      await p;
      return task(spec);
    }, Promise.resolve(null));
    return;
  }

  const pMap = arr.map(async (spec) => await task(spec));
  await Promise.all(pMap);
};

export default pExec;
