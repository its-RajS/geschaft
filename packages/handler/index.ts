export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly httpStatusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    httpStatusCode: number,
    isOperational = true,
    details?: unknown
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
  constructor(message: string, details?: unknown) {
    super(message, 404, true, details);
  }
}

//! Validation Error (for Joi/zod)
export class ValidationError extends AppError {
  constructor(message: 'invalid req data', details?: unknown) {
    super(message, 400, true, details);
  }
}

//! Authentication Error
export class AuthenticationError extends AppError {
  constructor(
    message: 'unauthorized' | 'invalid token' | 'token expired',
    details?: unknown
  ) {
    super(message, 401, true, details);
  }
}

//! Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message: 'forbidden access', details?: unknown) {
    super(message, 403, true, details);
  }
}

//! Database Error
export class DatabaseError extends AppError {
  constructor(message: 'database error', details?: unknown) {
    super(message, 500, true, details);
  }
}

//! Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message: 'rate limit exceeded', details?: unknown) {
    super(message, 429, true, details);
  }
}
