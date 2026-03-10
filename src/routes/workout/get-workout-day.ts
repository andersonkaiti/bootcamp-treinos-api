import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import {
  errorSchema,
  getWorkoutDayResponseSchema,
} from '../../schemas/index.ts'
import { GetWorkoutDay } from '../../use-cases/get-workout-day.ts'

export async function getWorkoutDayRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/workout-plans/:planId/days/:dayId',
    schema: {
      tags: ['Workout Plan'],
      summary: 'Get a workout day by ID',
      params: z.object({
        planId: z.string().uuid(),
        dayId: z.string().uuid(),
      }),
      response: {
        200: getWorkoutDayResponseSchema,
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
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

      const { planId, dayId } = request.params
      const getWorkoutDay = new GetWorkoutDay()

      const result = await getWorkoutDay.execute({
        userId: session.user.id,
        workoutPlanId: planId,
        workoutDayId: dayId,
      })

      return reply.status(200).send(result)
    },
  })
}
