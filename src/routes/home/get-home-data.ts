import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import {
  errorSchema,
  getHomeDataParamsSchema,
  getHomeDataResponseSchema,
} from '../../schemas/index.ts'
import { GetHomeData } from '../../use-cases/get-home-data.ts'

export async function getHomeDataRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/home/:date',
    schema: {
      operationId: 'getHomeData',
      tags: ['Home'],
      summary: 'Get house dashboard data',
      params: getHomeDataParamsSchema,
      response: {
        200: getHomeDataResponseSchema,
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
