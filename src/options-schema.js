export default {
  title: 'FileManagerPluginOptions',
  type: 'object',
  additionalProperties: false,
  definitions: {
    Copy: {
      description: 'Copy individual files or entire directories from a source folder to a destination folder',
      type: 'array',
      minItems: 1,
      additionalItems: true,
      itmes: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            source: {
              description: 'Copy source. A file or directory or a glob',
              type: 'string',
              minLength: 1,
            },
            destination: {
              description: 'Copy destination',
              type: 'string',
              minLength: 1,
            },
            options: {
              additionalProperties: false,
              type: 'object',
              description: 'Options to forward to archiver',
              properties: {
                flat: {
                  description: 'Flatten the directory structure. All copied files will be put in the same directory',
                  type: 'boolean',
                  default: false,
                },
                overwrite: {
                  description: 'overwrite existing file or directory',
                  type: 'boolean',
                  default: true,
                },
                preserveTimestamps: {
                  description: 'Set last modification and access times to the ones of the original source files',
                  type: 'boolean',
                  default: false,
                },
              },
            },
            globOptions: {
              additionalProperties: true,
              type: 'object',
              description: 'Options to forward to fast-glob',
            },
          },
        },
      ],
    },
    Delete: {
      description: 'Delete individual files or entire directories',
      type: 'array',
      minItems: 1,
      additionalItems: true,
      items: {
        anyOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              source: {
                type: 'string',
                minLength: 1,
              },
              options: {
                additionalProperties: true,
                type: 'object',
                description: 'Options to forward to del',
              },
            },
          },
          {
            type: 'string',
            minLength: 1,
          },
        ],
      },
    },
    Move: {
      description: 'Move individual files or entire directories from a source folder to a destination folder',
      type: 'array',
      additionalItems: true,
      items: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            source: {
              description: 'Move source. A file or directory or a glob',
              type: 'string',
              minLength: 1,
            },
            destination: {
              description: 'Move destination',
              type: 'string',
              minLength: 1,
            },
          },
        },
      ],
    },
    Mkdir: {
      description: 'Create Directories',
      type: 'array',
      minItems: 1,
      additionalItems: true,
      items: {
        type: 'string',
      },
    },
    Archive: {
      description: 'Archive individual files or entire directories.',
      type: 'array',
      additionalItems: true,
      items: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            source: {
              description: 'Source. A file or directory or a glob',
              type: 'string',
              minLength: 1,
            },
            destination: {
              description: 'Archive destination',
              type: 'string',
              minLength: 1,
            },
            format: {
              type: 'string',
              enum: ['zip', 'tar'],
            },
            options: {
              additionalProperties: true,
              type: 'object',
              description: 'Options to forward to archiver',
            },
          },
        },
      ],
    },
    Actions: {
      type: 'object',
      additionalProperties: false,
      properties: {
        copy: {
          $ref: '#/definitions/Copy',
        },
        delete: {
          $ref: '#/definitions/Delete',
        },
        move: {
          $ref: '#/definitions/Move',
        },
        mkdir: {
          $ref: '#/definitions/Mkdir',
        },
        archive: {
          $ref: '#/definitions/Archive',
        },
      },
    },
  },
  properties: {
    events: {
      type: 'object',
      additionalProperties: false,
      properties: {
        onStart: {
          oneOf: [
            {
              $ref: '#/definitions/Actions',
            },
            {
              type: 'array',
              items: {
                $ref: '#/definitions/Actions',
              },
            },
          ],
        },
        onEnd: {
          oneOf: [
            {
              $ref: '#/definitions/Actions',
            },
            {
              type: 'array',
              items: {
                $ref: '#/definitions/Actions',
              },
            },
          ],
        },
      },
    },
    runTasksInSeries: {
      type: 'boolean',
      default: false,
      description: 'Run tasks in an action in series',
    },
    context: {
      type: 'string',
      description: 'The directory, an absolute path, for resolving files. Defaults to webpack context',
    },
    runOnceInWatchMode: {
      type: 'boolean',
      default: false,
      description: 'Run tasks only at first compilation in watch mode',
    },
  },
};
