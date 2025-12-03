// src/services/firebaseStorage.js
const admin = require('firebase-admin');
const path = require('path');

require('dotenv').config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not set');

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

async function uploadBuffer({ buffer, destinationPath, contentType, metadata = {} }) {
  const file = bucket.file(destinationPath);
  const stream = file.createWriteStream({
    metadata: {
      contentType,
      metadata
    },
    resumable: false // small files: ok; for large files you can enable resumable
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => reject(err));
    stream.on('finish', async () => {
      try {
        // Make file private by default (do not call makePublic)
        // Generate signed URL (time-limited) for download
        const expires = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires
        });

        resolve({ path: destinationPath, url, bucket: file.bucket.name });
      } catch (err) {
        reject(err);
      }
    });
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer };
