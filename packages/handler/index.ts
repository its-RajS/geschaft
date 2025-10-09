export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly httpStatusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    httpStatusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

//! Not Found
export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 404, true, details);
  }
}

//! Validation Error (for Joi/zod)
export class ValidationError extends AppError {
  constructor(message: 'invalid req data', details?: any) {
    super(message, 400, true, details);
  }
}

//! Authentication Error
export class AuthenticationError extends AppError {
  constructor(
    message: 'unauthorized' | 'invalid token' | 'token expired',
    details?: any
  ) {
    super(message, 401, true, details);
  }
}

//! Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message: 'forbidden access', details?: any) {
    super(message, 403, true, details);
  }
}

//! Database Error
export class DatabaseError extends AppError {
  constructor(message: 'database error', details?: any) {
    super(message, 500, true, details);
  }
}

//! Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message: 'rate limit exceeded', details?: any) {
    super(message, 429, true, details);
  }
}
