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
        type: 'string',
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
    Events: {
      type: 'object',
      additionalProperties: true,
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
    onStart: {
      $ref: '#/definitions/Events',
    },
    onEnd: {
      $ref: '#/definitions/Events',
    },
  },
};
