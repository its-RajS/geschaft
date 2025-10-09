import { Request, Response } from 'express';
import { AppError } from '.';

export const errorHandler = (err: Error, req: Request, res: Response) => {
  //? handle app error
  if (err instanceof AppError) {
    res
      .status(err.httpStatusCode)
      .json({ message: err.message, details: err.details });
  } else {
    console.log('unhandled error', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
