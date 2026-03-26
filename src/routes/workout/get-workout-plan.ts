import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized'
import { auth } from '../../lib/auth'
import { errorSchema, getWorkoutPlanResponseSchema } from '../../schemas/index'
import { GetWorkoutPlan } from '../../use-cases/get-workout-plan'

export async function getWorkoutPlanRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/workout-plans/:id',
    schema: {
      operationId: 'getWorkoutPlan',
      tags: ['Workout Plan'],
      summary: 'Get a workout plan by ID',
      params: z.object({
        id: z.uuid(),
      }),
      response: {
        200: getWorkoutPlanResponseSchema,
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

      const { id } = request.params
      const getWorkoutPlan = new GetWorkoutPlan()

      const result = await getWorkoutPlan.execute({
        userId: session.user.id,
        workoutPlanId: id,
      })

      return reply.status(200).send(result)
    },
  })
}
