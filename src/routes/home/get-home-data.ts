import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { WeekDay } from '../../generated/prisma/enums.ts'
import { auth } from '../../lib/auth.ts'
import { errorSchema } from '../../schemas/index.ts'
import { GetHomeData } from '../../use-cases/get-home-data.ts'

export async function getHomeDataRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/home/:date',
    schema: {
      tags: ['Home'],
      summary: 'Get house dashboard data',
      params: z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      }),
      response: {
        200: z.object({
          activeWorkoutPlanId: z.string().uuid().nullable(),
          todayWorkoutDay: z
            .object({
              workoutPlanId: z.string().uuid(),
              id: z.string().uuid(),
              name: z.string(),
              isRest: z.boolean(),
              weekDay: z.enum(WeekDay),
              estimatedDurationInSeconds: z.number(),
              coverImageUrl: z.url().nullable().optional(),
              exercisesCount: z.number(),
            })
            .nullable(),
          workoutStreak: z.number(),
          consistencyByDay: z.record(
            z.string(),
            z.object({
              workoutDayCompleted: z.boolean(),
              workoutDayStarted: z.boolean(),
            }),
          ),
        }),
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

      const { date } = request.params

      const getHomeData = new GetHomeData()

      const result = await getHomeData.execute({
        userId: session.user.id,
        date,
      })

      return reply.status(200).send(result)
    },
  })
}
