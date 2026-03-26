import type { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { ConflictError } from './errors/conflict-error'
import { ForbiddenError } from './errors/forbidden-error'
import { NotFoundError } from './errors/not-found'
import { UnauthorizedError } from './errors/unauthorized'
import { WorkoutPlanNotActiveError } from './errors/workout-plan-not-active-error'

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

  if (error instanceof ForbiddenError) {
    return reply.status(403).send({
      error: error.message,
      code: 'FORBIDDEN_ERROR',
    })
  }

  if (error instanceof ConflictError) {
    return reply.status(409).send({
      error: error.message,
      code: 'CONFLICT_ERROR',
    })
  }

  if (error instanceof WorkoutPlanNotActiveError) {
    return reply.status(400).send({
      error: error.message,
      code: 'WORKOUT_PLAN_NOT_ACTIVE',
    })
  }

  return reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  })
}
