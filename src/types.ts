import { Compilation, Compiler } from 'webpack';

export type Logger = ReturnType<Compiler['getInfrastructureLogger']>;

export type TaskOptions = {
  runTasksInSeries: boolean;
  logger: Logger;
  handleError: (error: Error) => void;
};
