import { Compiler } from 'webpack';

export type Logger = ReturnType<Compiler['getInfrastructureLogger']>;
