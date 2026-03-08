import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { NotFoundError } from './errors/not-found.ts'
import { UnauthorizedError } from './errors/unauthorized.ts'

export async function errorHandler(
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: error.message,
      code: 'VALIDATION_ERROR',
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      error: error.message,
      code: 'UNAUTHORIZED',
    })
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      error: error.message,
      code: 'NOT_FOUND_ERROR',
    })
  }

  return reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  })
}
