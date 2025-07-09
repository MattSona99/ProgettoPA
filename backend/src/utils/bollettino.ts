// utils/pdf.ts
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { IMultaAttributes } from "../models/multa";
import { HttpErrorCodes, HttpErrorFactory } from "./errorHandler";

/**
 * Funzione per generare il bollettino in formato PDF.
 * 
 * @param multa - La multa per generare il bollettino.
 * @param targa - La targa del veicolo.
 * @returns {Promise<Buffer>} - Un buffer contenente il bollettino in formato PDF.
 */
export async function generateBollettinoPDFBuffer(multa: IMultaAttributes, targa: string): Promise<Buffer> {
    const pdf = new jsPDF();
    const qrData = `<${multa.uuid_pagamento}>|<${multa.id_multa}>|<${targa}>|<${multa.importo}>`;

    try {
        // genera QR code in PNG
        const qrBuffer = await QRCode.toBuffer(qrData, { type: 'png' });

        pdf.text(`Bollettino di pagamento per la multa ${multa.id_multa}`, 10, 20);
        pdf.text(`Importo: €${multa.importo.toFixed(2)}`, 10, 30);
        pdf.text(`Targa: ${targa}`, 10, 40);
        pdf.addImage(qrBuffer.toString('base64'), 'PNG', 10, 50, 50, 50);

        // ritorna ArrayBuffer → Buffer
        const arrayBuf = pdf.output('arraybuffer');
        return Buffer.from(arrayBuf);
    }
    catch {
        throw HttpErrorFactory.createError(HttpErrorCodes.InternalServerError, "Errore nella creazione del bollettino.");
    }
}
