const compile = (compiler) => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(new Error(stats.toString()));
      }

      return resolve(stats);
    });
  });
};

export default compile;
