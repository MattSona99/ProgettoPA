// src/middleware/upload.ts
import multer from 'multer';

// Storage in memoria (se passi poi a tesseract.js dalla buffer)
const storage = multer.memoryStorage();

// Funzione per la gestione delle immagini
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },        // max 5 MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.match(/^image\/(png|jpe?g)$/)) {
      return cb(new Error('Tipo di file non consentito') as any, false);
    }
    cb(null, true);
  }
});
