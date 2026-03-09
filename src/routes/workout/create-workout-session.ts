import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import { errorSchema } from '../../schemas/index.ts'
import { StartWorkoutSession } from '../../use-cases/start-workout-session.ts'

export async function createWorkoutSessionRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/workout-plans/:workoutPlanId/days/:workoutDayId/sessions',
    schema: {
      tags: ['Workout Plan'],
      summary: 'Create a new workout session',
      params: z.object({
        workoutPlanId: z.string().uuid(),
        workoutDayId: z.string().uuid(),
      }),
      response: {
        201: z.object({
          userWorkoutSessionId: z.string().uuid(),
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
