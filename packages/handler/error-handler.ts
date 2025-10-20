import { Request, Response, NextFunction } from 'express';
import { AppError } from './index';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  void _next;
  //? handle app error
  if (err instanceof AppError) {
    return res
      .status(err.httpStatusCode)
      .json({ status: 'error', message: err.message, details: err.details });
  } else {
    console.log('unhandled error', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
