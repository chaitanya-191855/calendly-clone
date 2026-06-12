import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  status?: number
  errors?: unknown
}

export function createError(
  status: number,
  message: string,
  errors?: unknown,
): AppError {
  const err = new Error(message) as AppError
  err.status = status
  if (errors !== undefined) err.errors = errors
  return err
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? 500

  if (status >= 500) {
    console.error('[ERROR]', err)
  }

  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(err.errors !== undefined ? { errors: err.errors } : {}),
  })
}
