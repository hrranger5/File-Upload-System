// src/middleware/multerConfig.js
const multer = require('multer');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // default 5MB
const ALLOWED = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,zip,pptx,txt,rar').split(',').map(s => s.trim().toLowerCase());

// Memory storage so we can upload buffer to Firebase
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = mime.extension(file.mimetype) || '';
  const originalExt = (file.originalname.split('.').pop() || '').toLowerCase();

  // allow if mime type extension or file extension matches allowed list
  if (ALLOWED.includes(ext) || ALLOWED.includes(originalExt)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

module.exports = { upload };
