import { Response } from 'express';

export const handleError = (res: Response, error: unknown, message: string): void => {
  const err = error as { name?: string; code?: number; message?: string };

  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    res.status(400).json({ message: 'Invalid data', error: err.message });
    return;
  }

  if (err?.code === 11000) {
    res.status(409).json({ message: 'Duplicate value: this record already exists' });
    return;
  }

  if (error instanceof AppError) {
  res.status(error.status).json({ message: error.message });
  return;
  }
  
  console.error(message, error);
  res.status(500).json({ message });
};
export class AppError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super('User already exists', 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}
