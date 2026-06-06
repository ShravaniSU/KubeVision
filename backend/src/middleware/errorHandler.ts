import { Prisma } from '@prisma/client'
import { type ErrorRequestHandler, type RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint failed', code: err.code })
    }

    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found', code: err.code })
    }
  }

  const status = err.statusCode ?? 500
  const message = err.message ?? 'Internal Server Error'
  return res.status(status).json({ error: message, code: status })
}
