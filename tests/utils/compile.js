const compile = (compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        return reject(new Error(stats.toString()));
      }

      return setTimeout(() => resolve(stats), 500);
    });
  });

export default compile;
