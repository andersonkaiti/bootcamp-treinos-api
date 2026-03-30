import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized'
import { auth } from '../../lib/auth'
import {
  addWorkoutDayBodySchema,
  errorSchema,
  workoutDayBaseSchema,
} from '../../schemas/index'
import { AddWorkoutDay } from '../../use-cases/add-workout-day'

export async function addWorkoutDayRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/workout-plans/:planId/days',
    schema: {
      operationId: 'addWorkoutDay',
      tags: ['Workout Plan'],
      summary: 'Add a new day to an existing workout plan',
      params: z.object({
        planId: z.string().uuid(),
      }),
      body: addWorkoutDayBodySchema,
      response: {
        201: workoutDayBaseSchema,
        400: errorSchema,
        401: errorSchema,
        404: errorSchema,
        500: errorSchema,
      },
    },
    async handler(request, reply) {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (!session) {
        throw new UnauthorizedError('Unauthorized')
      }

      const addWorkoutDay = new AddWorkoutDay()

      const { planId } = request.params
      const dayData = request.body

      const result = await addWorkoutDay.execute({
        userId: session.user.id,
        planId,
        ...dayData,
      })

      return reply.status(201).send(result)
    },
  })
}
