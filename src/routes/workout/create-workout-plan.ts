import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import { errorSchema, workoutPlanSchema } from '../../schemas/index.ts'
import { CreateWorkoutPlan } from '../../use-cases/create-workout-plan.ts'

export async function createWorkoutPlanRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/workout-plans',
    schema: {
      operationId: 'createWorkoutPlan',
      tags: ['Workout Plan'],
      summary: 'Create a new workout plan',
      body: workoutPlanSchema.omit({
        id: true,
      }),
      response: {
        201: workoutPlanSchema,
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

      const createWorkoutPlan = new CreateWorkoutPlan()

      const { name, workoutDays } = request.body

      const result = await createWorkoutPlan.execute({
        userId: session.user.id,
        name,
        workoutDays,
      })

      return reply.status(201).send(result)
    },
  })
}
