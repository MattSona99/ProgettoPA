import multer from 'multer';
import { HttpErrorFactory, HttpErrorCodes } from '../../utils/errorHandler';

// Storage in memoria (se passi poi a tesseract.js dalla buffer)
const storage = multer.memoryStorage();

// Funzione per la gestione delle immagini
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },        // max 5MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.match(/^image\/(png|jpe?g)$/)) {
      return cb(HttpErrorFactory.createError(HttpErrorCodes.BadRequest, 'Formato immagine non valido.'));
    }
    cb(null, true);
  }
});
