// src/routes/uploadRouter.js
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/multerConfig');
const { handleUpload } = require('../controllers/uploadController');

// placeholder auth middleware - replace with your auth
function authMiddleware(req, res, next) {
  // Example: if using JWT, decode and set req.user
  // req.user = { id: 123, name: 'Hafsa' }
  next();
}

// single file upload: field name "file"
router.post('/upload', authMiddleware, upload.single('file'), handleUpload);

module.exports = router;
