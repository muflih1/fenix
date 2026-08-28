import type {NextFunction, Request, Response} from 'express';
import {HttpException} from '../../exceptions/index.js';
import {HttpStatus} from '../../enums/http-status.enum.js';

export function globalErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log('globalErrorHandler cought an error:', error);
  
  if (error instanceof HttpException) {
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      error: error.message,
    });
  }

  return res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal server error',
    });
}
