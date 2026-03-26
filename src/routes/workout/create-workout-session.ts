import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized'
import { auth } from '../../lib/auth'
import { errorSchema } from '../../schemas/index'
import { StartWorkoutSession } from '../../use-cases/start-workout-session'

export async function createWorkoutSessionRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/workout-plans/:workoutPlanId/days/:workoutDayId/sessions',
    schema: {
      operationId: 'createWorkoutSession',
      tags: ['Workout Plan'],
      summary: 'Create a new workout session',
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
      }),
      response: {
        201: z.object({
          userWorkoutSessionId: z.uuid(),
        }),
        400: errorSchema,
        401: errorSchema,
        404: errorSchema,
        409: errorSchema,
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

      const { workoutPlanId, workoutDayId } = request.params

      const startWorkoutSession = new StartWorkoutSession()

      const result = await startWorkoutSession.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId,
      })

      return reply.status(201).send(result)
    },
  })
}
