import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { UnauthorizedError } from '../../errors/unauthorized.ts'
import { auth } from '../../lib/auth.ts'
import {
  errorSchema,
  getUserTrainDataResponseSchema,
  upsertUserTrainDataBodySchema,
  upsertUserTrainDataResponseSchema,
} from '../../schemas/index.ts'
import { GetUserTrainData } from '../../use-cases/get-user-train-data.ts'
import { UpsertUserTrainData } from '../../use-cases/upsert-user-train-data.ts'

export async function userRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    schema: {
      tags: ['User'],
      summary: 'Get current user training data',
      response: {
        200: getUserTrainDataResponseSchema,
        401: errorSchema,
      },
    },
    async handler(request, reply) {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (!session) {
        throw new UnauthorizedError('Unauthorized')
      }

      const getUserTrainData = new GetUserTrainData()
      const result = await getUserTrainData.execute(session.user.id)

      return reply.status(200).send(result)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/me/training-data',
    schema: {
      tags: ['User'],
      summary: 'Upsert user training data',
      body: upsertUserTrainDataBodySchema,
      response: {
        200: upsertUserTrainDataResponseSchema,
        401: errorSchema,
      },
    },
    async handler(request, reply) {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (!session) {
        throw new UnauthorizedError('Unauthorized')
      }

      const upsertUserTrainData = new UpsertUserTrainData()
      const result = await upsertUserTrainData.execute({
        userId: session.user.id,
        ...request.body,
      })

      return reply.status(200).send(result)
    },
  })
}
