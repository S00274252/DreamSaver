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

  console.error(message, error);
  res.status(500).json({ message });
};
