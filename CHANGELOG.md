# Changelog

All notable changes to this project will be documented in this file.

## v8.0.0 (2022-11-16)

- drop nodejs 12 support, requires node 14.13.1+ ([0f334f0](https://github.com/gregnb/filemanager-webpack-plugin/commit/0f334f0))
- fix export syntax for typings ([59b17ca](https://github.com/gregnb/filemanager-webpack-plugin/commit/59b17ca))
- update to rollup 3 ([23e332c](https://github.com/gregnb/filemanager-webpack-plugin/commit/23e332c))

## v7.0.0 (2022-06-11)

- no notable changes since v7.0.0-beta.0

## v7.0.0-beta.0 (2022-04-09)

- no notable changes since v7.0.0-alpha.2

## v7.0.0-alpha.2 (2022-02-01)

#### Bug Fixes

- fix typings for copy actions ([100686f](https://github.com/gregnb/filemanager-webpack-plugin/commit/100686f))

#### Dependency Updates

- bump all dependencies to latest ([1dc902b](https://github.com/gregnb/filemanager-webpack-plugin/commit/1dc902b))

#### Internal

- update LICENSE ([aafd652](https://github.com/gregnb/filemanager-webpack-plugin/commit/aafd652))

## v7.0.0-alpha.1 (2021-12-04)

#### Features

- support flat copy with glob ([83bf2dd](https://github.com/gregnb/filemanager-webpack-plugin/commit/83bf2dd))
- add copy options `overwrite` and `preserveTimestamps` ([83bf2dd](https://github.com/gregnb/filemanager-webpack-plugin/commit/83bf2dd))

## v7.0.0-alpha.0 (2021-12-03)

#### Bug Fixes

- remove cpy dependency, fixing vulnerabilities ([9dcfbd8](https://github.com/gregnb/filemanager-webpack-plugin/commit/9dcfbd8))

#### Breaking Changes

- copy with glob by default maintains directory structure ([9dcfbd8](https://github.com/gregnb/filemanager-webpack-plugin/commit/9dcfbd8))

## v6.1.7 (2021-09-10)

#### Bug Fixes

- Revert npm engines requirement ([a794942](https://github.com/gregnb/filemanager-webpack-plugin/commit/a794942))

## v6.1.6 (2021-08-21)

#### Bug Fixes

- fix archiver creating invalid archives ([9204617](https://github.com/gregnb/filemanager-webpack-plugin/commit/9204617))

## v6.1.5 (2021-08-14)

#### Features

- add type definitions ([1888ce4](https://github.com/gregnb/filemanager-webpack-plugin/commit/1888ce4))

## v6.1.4 (2021-06-29)

#### Bug Fixes

- add `runOnceInWatchMode` option to validation schema ([6fe28f1](https://github.com/gregnb/filemanager-webpack-plugin/commit/6fe28f1))

## v6.1.3 (2021-06-27)

#### Bug Fixes

- consume archiver ignore options correctly ([5c6f84b](https://github.com/gregnb/filemanager-webpack-plugin/commit/5c6f84b)), ([019f8da](https://github.com/gregnb/filemanager-webpack-plugin/commit/019f8da))

## v6.1.2 (2021-06-25)

#### Bug Fixes

- remove `node:` protocol for CJS support ([da97771](https://github.com/gregnb/filemanager-webpack-plugin/commit/da97771))

## v6.1.1 (2021-06-24)

#### Bug Fixes

- fix incompatibility with CJS ([e0f92a4](https://github.com/gregnb/filemanager-webpack-plugin/commit/e0f92a4))

## v6.1.0 (2021-06-24)

#### Features

- add option `runOnceInWatchMode` ([50f4912](https://github.com/gregnb/filemanager-webpack-plugin/commit/50f4912))

## v6.0.0 (2021-06-24)

#### Features

- support ES Modules ([ab86f31](https://github.com/gregnb/filemanager-webpack-plugin/commit/ab86f31))

#### Breaking Changes

- required node versions `^12.20.0 || ^14.13.1 || >=16.0.0` ([ab86f31](https://github.com/gregnb/filemanager-webpack-plugin/commit/ab86f31))

## v5.0.0 (2021-05-10)

#### Dependency Updates

- update to fs-extras v10 ([3cebee5](https://github.com/gregnb/filemanager-webpack-plugin/commit/3cebee5))

#### Breaking Changes

- drop nodejs 10 support, requires node 12+

## v4.0.0 (2021-03-07)

#### Breaking Changes

- drop webpack 4 ([4354e86](https://github.com/gregnb/filemanager-webpack-plugin/commit/4354e86))

## v3.1.1 (2021-03-07)

#### Bug Fixes

- fix error while copying absolute glob source ([fe20026](https://github.com/gregnb/filemanager-webpack-plugin/commit/fe20026))

## v3.1.0 (2020-01-16)

#### Features

- support options to forward to `del` ([fe20026](https://github.com/gregnb/filemanager-webpack-plugin/commit/fe20026))

## v3.0.0 (2020-12-26)

No notable changes since v3.0.0-beta.0

## v3.0.0-beta.0 (2020-11-19)

#### Enhancements

- add logs and handle errors ([1fadb46](https://github.com/gregnb/filemanager-webpack-plugin/commit/1fadb46))

## v3.0.0-alpha.7 (2020-11-08)

#### Bug Fixes

- preserve timestamps while copying ([00de8e6](https://github.com/gregnb/filemanager-webpack-plugin/commit/00de8e6)), closes [#48](https://github.com/gregnb/filemanager-webpack-plugin/issues/48)

## v3.0.0-alpha.6 (2020-11-06)

#### Features

- add option to specify `context` ([fac605e](https://github.com/gregnb/filemanager-webpack-plugin/commit/fac605e))

## v3.0.0-alpha.5 (2020-11-04)

#### Bug Fixes

- Fix copy action execution in series ([7837f41](https://github.com/gregnb/filemanager-webpack-plugin/commit/7837f41)), closes [#84](https://github.com/gregnb/filemanager-webpack-plugin/issues/84)

## v3.0.0-alpha.4 (2020-10-27)

#### Bug Fixes

- run all actions in the event ([8dc5bab](https://github.com/gregnb/filemanager-webpack-plugin/commit/8dc5bab))
- fix ignore behaviour in archiver action ([30aa49a](https://github.com/gregnb/filemanager-webpack-plugin/commit/30aa49a))

#### Features

- add option to run tasks in series ([034f645](https://github.com/gregnb/filemanager-webpack-plugin/commit/034f645))

## v3.0.0-alpha.3 (2020-10-26)

- use native mkdir ([13720b3](https://github.com/gregnb/filemanager-webpack-plugin/commit/13720b3))
- fix onStart Event not executed in watch mode. ([cb0c180](https://github.com/gregnb/filemanager-webpack-plugin/commit/cb0c180))
- execute all tasks in series ([5fd2f16](https://github.com/gregnb/filemanager-webpack-plugin/commit/5fd2f16))
- support execution order ([cb0c180](https://github.com/gregnb/filemanager-webpack-plugin/commit/cb0c180))

#### Breaking Changes

- minimum required node version v10.13 ([5884440](https://github.com/gregnb/filemanager-webpack-plugin/commit/5884440))
- file events moved into event object. See [README](https://github.com/gregnb/filemanager-webpack-plugin/blob/master/README.md) ([525f35d](https://github.com/gregnb/filemanager-webpack-plugin/commit/525f35d))

## v3.0.0-alpha.2 (2020-10-22)

#### Features

- support webpack 5

#### Enhancements

- removed dependency `mv` and `mkdir`, use `fs-extra` instead
- run tests in `ubuntu`, `windows` and `mac`
- added more tests for all actions

#### Breaking Changes

- requires node 10.13 or above
- removed verbose option, will be added in upcoming releases

## v3.0.0-alpha.1 (2020-10-04)

#### Enhancements

- reduce build size ([1765520](https://github.com/gregnb/filemanager-webpack-plugin/commit/1765520))

## v3.0.0-alpha.0 (2020-10-04)

#### Enhancements

- replace [cpx](https://www.npmjs.com/cpx) with [cpy](https://www.npmjs.com/cpy) ([9c8eff9](https://github.com/gregnb/filemanager-webpack-plugin/commit/9c8eff9))
- remove fs-extra dependency ([9c8eff9](https://github.com/gregnb/filemanager-webpack-plugin/commit/9c8eff9))
- add schema validation for options ([fec1785](https://github.com/gregnb/filemanager-webpack-plugin/commit/fec1785))

#### Breaking Changes

- drop webpack 3 support ([6d994a6](https://github.com/gregnb/filemanager-webpack-plugin/commit/6d994a6))
- update archiver to v5, refer [archiver changelog](https://github.com/archiverjs/node-archiver/blob/master/CHANGELOG.md) for more details ([f584a83](https://github.com/gregnb/filemanager-webpack-plugin/commit/f584a83))
