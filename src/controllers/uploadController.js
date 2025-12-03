// src/controllers/uploadController.js
const { uploadBuffer } = require('../services/firebaseStorage');
const path = require('path');
const { FileRecord /*, Intern */ } = require('../db/models'); // adapt to your models
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');

async function handleUpload(req, res) {
  try {
    // authMiddleware should set req.user or req.internId
    const internId = req.user?.id || req.body.internId;
    if (!internId) return res.status(401).json({ error: 'Unauthorized or internId required' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file; // buffer available
    const originalName = file.originalname;
    const contentType = file.mimetype || mime.lookup(originalName) || 'application/octet-stream';
    const ext = path.extname(originalName);

    // Make a safe destination path
    const uniqueId = uuidv4();
    const safeFilename = `${Date.now()}_${uniqueId}${ext}`;
    const destinationPath = `uploads/${internId}/${safeFilename}`;

    // Upload to Firebase
    const uploadResult = await uploadBuffer({
      buffer: file.buffer,
      destinationPath,
      contentType,
      metadata: {
        originalName,
        uploadedBy: internId.toString()
      }
    });

    // Save metadata to DB
    const record = await FileRecord.create({
      intern_id: internId,
      filename: safeFilename,
      original_name: originalName,
      content_type: contentType,
      size: file.size,
      storage_path: uploadResult.path,
      url: uploadResult.url,
      uploaded_at: new Date()
    });

    return res.json({
      ok: true,
      message: 'File uploaded',
      file: {
        id: record.id,
        url: record.url,
        original_name: record.original_name,
        size: record.size
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    // Handle Multer errors gracefully
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large', maxSize: process.env.MAX_FILE_SIZE });
    }
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    return res.status(500).json({ error: 'upload_failed', details: err.message });
  }
}

module.exports = { handleUpload };
