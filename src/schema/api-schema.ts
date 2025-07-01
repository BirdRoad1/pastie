export const fileUploadSchema = {
    $id: 'fileUpload',
    type: 'object',
    properties: {
      title: { type: 'string' },
      body: {
        type: 'string',
        maxLength: 10 * 1000 * 1000 // 10 MB max length
      },
      visibility: {
        type: 'string',
        enum: ['PUBLIC', 'ENCRYPTED']
      }
    },
    required: ['body', 'visibility']
  };