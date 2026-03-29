import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized'
import { auth } from '../../lib/auth'
import {
  errorSchema,
  getWorkoutPlanResponseSchema,
  updateWorkoutPlanBodySchema,
} from '../../schemas/index'
import { UpdateWorkoutPlan } from '../../use-cases/update-workout-plan'

export async function updateWorkoutPlanRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/workout-plans/:id',
    schema: {
      operationId: 'updateWorkoutPlan',
      tags: ['Workout Plan'],
      summary: 'Update an existing workout plan (partial updates)',
      params: z.object({
        id: z.string().uuid(),
      }),
      body: updateWorkoutPlanBodySchema,
      response: {
        200: getWorkoutPlanResponseSchema,
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

      const updateWorkoutPlan = new UpdateWorkoutPlan()

      const { id } = request.params
      const updateData = request.body

      const result = await updateWorkoutPlan.execute({
        userId: session.user.id,
        planId: id,
        ...updateData,
      })

      return reply.status(200).send(result)
    },
  })
}
