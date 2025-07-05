/**
 * Enum per la gestione degli errori personalizzati.
 */
export enum HttpErrorCodes {
    BadRequest = 'BadRequest',
    Unauthorized = 'Unauthorized',
    Forbidden = 'Forbidden',
    NotFound = 'NotFound',
    InternalServerError = 'InternalServerError',
    InvalidID = 'InvalidID',
    InvalidToken = 'InvalidToken',
    JsonWebTokenError = 'JsonWebTokenError',
    TokenExpiredError = 'TokenExpiredError',
}