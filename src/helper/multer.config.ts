

import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads',

    filename: (req, file, callback) => {
      const uniqueName =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      callback(
        null,
        uniqueName + extname(file.originalname),
      );
    },
  }),

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg/png images allowed'), false);
    }
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};