import type { ArchiverOptions } from 'archiver';
import type { Options as DelOptions } from 'del';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { CopyOptions } from 'fs-extra';
import type { Options as FgOptions } from 'fast-glob';

type FsCopyOptions = Pick<CopyOptions, 'overwrite' | 'preserveTimestamps'>;

interface CopyActionOptions extends FsCopyOptions {
  /**
   * Flatten directory structure. All copied files will be put in the same directory.
   * disabled by default
   */
  flat: boolean;
}

/** Copy individual files or entire directories from a source folder to a destination folder */
type Copy = {
  /** Copy source. A file or directory or a glob */
  source: string;
  /** Copy destination */
  destination: string;
  /** Copy Options */
  options?: CopyActionOptions;
  /** Glob options */
  globOptions?: Omit<FgOptions, 'absolute' | 'cwd'>;
}[];

/** Delete individual files or entire directories */
type Delete = (
  | {
      /** A folder or file or a glob to delete */
      source: string;
      /** Options to forward to del */
      options: DelOptions;
    }
  | string
)[];

/** Move individual files or entire directories from a source folder to a destination folder */
type Move = {
  /** Move source. A file or directory or a glob */
  source: string;
  /** Move destination */
  destination: string;
}[];

/** Create Directories */
type Mkdir = string[];

/** Archive individual files or entire directories. */
type Archive = {
  /** Source. A file or directory or a glob */
  source: string;
  /** Archive destination */
  destination: string;
  format?: 'zip' | 'tar';
  options?: ArchiverOptions | { globOptions: ReaddirGlobOptions };
}[];

/** {@link https://github.com/Yqnn/node-readdir-glob#options} */
interface ReaddirGlobOptions {
  /** Glob pattern or Array of Glob patterns to match the found files with. A file has to match at least one of the provided patterns to be returned. */
  pattern?: string | string[];
  /** Glob pattern or Array of Glob patterns to exclude matches. If a file or a folder matches at least one of the provided patterns, it's not returned. It doesn't prevent files from folder content to be returned. Note: ignore patterns are always in dot:true mode. */
  ignore?: string | string[];
  /** Glob pattern or Array of Glob patterns to exclude folders. If a folder matches one of the provided patterns, it's not returned, and it's not explored: this prevents any of its children to be returned. Note: skip patterns are always in dot:true mode. */
  skip?: string | string[];
  /** Add a / character to directory matches. */
  mark?: boolean;
  /** Set to true to stat all results. This reduces performance. */
  stat?: boolean;
  /** When an unusual error is encountered when attempting to read a directory, a warning will be printed to stderr. Set the silent option to true to suppress these warnings. */
  silent?: boolean;
  /** Do not match directories, only files. */
  nodir?: boolean;
  /** Follow symlinked directories. Note that requires to stat all results, and so reduces performance. */
  follow?: boolean;
  /** Allow pattern to match filenames starting with a period, even if the pattern does not explicitly have a period in that spot. */
  dot?: boolean;
  /** Disable ** matching against multiple folder names. */
  noglobstar?: boolean;
  /** Perform a case-insensitive match. Note: on case-insensitive filesystems, non-magic patterns will match by default, since stat and readdir will not raise errors. */
  nocase?: boolean;
  /** Perform a basename-only match if the pattern does not contain any slash characters. That is, *.js would be treated as equivalent to ** /*.js, matching all js files in all directories. */
  matchBase?: boolean;
}

interface Actions {
  copy?: Copy;
  delete?: Delete;
  move?: Move;
  mkdir?: Mkdir;
  archive?: Archive;
}

interface Options {
  events?: {
    /**
     * Commands to execute before Webpack begins the bundling process
     * Note: OnStart might execute twice for file changes in webpack context.
     */
    onStart?: Actions | Actions[];
    /**
     * Commands to execute after Webpack has finished the bundling process
     */
    onEnd?: Actions | Actions[];
  };
  /**
   * Run tasks in an action in series
   */
  runTasksInSeries?: boolean;
  /**
   * Run tasks only at first compilation in watch mode
   */
  runOnceInWatchMode?: boolean;
  /**
   * The directory, an absolute path, for resolving files. Defaults to webpack context
   */
  context?: string;
}

declare class FileManagerPlugin implements WebpackPluginInstance {
  constructor(options?: Options);
  apply(compiler: Compiler): void;
}

export default FileManagerPlugin;
