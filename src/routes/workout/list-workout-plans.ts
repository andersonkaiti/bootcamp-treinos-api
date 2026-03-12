import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import {
  errorSchema,
  listWorkoutPlansQuerySchema,
  listWorkoutPlansResponseSchema,
} from '../../schemas/index.ts'
import { ListWorkoutPlans } from '../../use-cases/list-workout-plans.ts'

export async function listWorkoutPlansRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/workout-plans',
    schema: {
      tags: ['Workout Plan'],
      summary: 'List workout plans',
      querystring: listWorkoutPlansQuerySchema,
      response: {
        200: listWorkoutPlansResponseSchema,
        400: errorSchema,
        401: errorSchema,
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

      const { active } = request.query
      const listWorkoutPlans = new ListWorkoutPlans()

      const result = await listWorkoutPlans.execute({
        userId: session.user.id,
        active,
      })

      return reply.status(200).send(result)
    },
  })
}
