import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized'
import { auth } from '../../lib/auth'
import { errorSchema } from '../../schemas/index'
import { RemoveWorkoutDay } from '../../use-cases/remove-workout-day'

export async function removeWorkoutDayRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/workout-plans/:planId/days/:dayId',
    schema: {
      operationId: 'removeWorkoutDay',
      tags: ['Workout Plan'],
      summary: 'Remove a day from a workout plan',
      params: z.object({
        planId: z.string().uuid(),
        dayId: z.string().uuid(),
      }),
      response: {
        204: z.void(),
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

      const removeWorkoutDay = new RemoveWorkoutDay()

      const { planId, dayId } = request.params

      await removeWorkoutDay.execute({
        userId: session.user.id,
        planId,
        dayId,
      })

      return reply.status(204).send()
    },
  })
}
