import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import { errorSchema } from '../../schemas/index.ts'
import { CompleteWorkoutSession } from '../../use-cases/complete-workout-session.ts'

export async function completeWorkoutSessionRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/workout-plans/:workoutPlanId/days/:workoutDayId/sessions/:sessionId',
    schema: {
      operationId: 'completeWorkoutSession',
      tags: ['Workout Plan'],
      summary: 'Complete a workout session',
      params: z.object({
        workoutPlanId: z.uuid(),
        workoutDayId: z.uuid(),
        sessionId: z.uuid(),
      }),
      body: z.object({
        completedAt: z.date(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          startedAt: z.date(),
          completedAt: z.date(),
        }),
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

      const { workoutPlanId, workoutDayId, sessionId } = request.params
      const { completedAt } = request.body

      const completeWorkoutSession = new CompleteWorkoutSession()

      const result = await completeWorkoutSession.execute({
        userId: session.user.id,
        workoutPlanId,
        workoutDayId,
        sessionId,
        completedAt,
      })

      return reply.status(200).send(result)
    },
  })
}
