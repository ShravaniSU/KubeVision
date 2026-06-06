import { type NextFunction, type Request, type Response, type RequestHandler } from 'express'
import { type ZodSchema } from 'zod'

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.format() })
    }

    req.body = result.data
    return next()
  }
}
