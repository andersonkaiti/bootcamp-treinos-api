import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { UnauthorizedError } from '../errors/unauthorized'
import { auth } from '../lib/auth'
import {
  errorSchema,
  getStatsQuerySchema,
  getStatsResponseSchema,
} from '../schemas/index'
import { GetStats } from '../use-cases/get-stats'

export async function statsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/stats',
    schema: {
      operationId: 'getStats',
      tags: ['Stats'],
      summary: 'Get user workout statistics',
      querystring: getStatsQuerySchema,
      response: {
        200: getStatsResponseSchema,
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

      const { from, to } = request.query
      const getStats = new GetStats()

      const result = await getStats.execute({
        userId: session.user.id,
        from,
        to,
      })

      return reply.status(200).send(result)
    },
  })
}
