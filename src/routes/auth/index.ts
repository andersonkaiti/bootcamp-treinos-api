import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env'
import { auth } from '../../lib/auth'

export async function authRoute(app: FastifyInstance) {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    schema: {
      hide: true,
    },
    async handler(request, reply) {
      try {
        const url = new URL(request.url, env.BETTER_AUTH_URL)

        const headers = new Headers()
        for (const [key, value] of Object.entries(request.headers)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              if (v) headers.append(key, v)
            }
          } else if (value) {
            headers.append(key, value.toString())
          }
        }

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        })

        const response = await auth.handler(req)

        reply.status(response.status)

        // Use forEach to iterate over headers as it handles multiple values correctly for some implementations
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() === 'set-cookie') {
            // Use getSetCookie if available to handle multiple cookies correctly
            const headersWithGetSetCookie = response.headers as Headers & {
              getSetCookie?: () => string[]
            }
            const cookies =
              typeof headersWithGetSetCookie.getSetCookie === 'function'
                ? headersWithGetSetCookie.getSetCookie()
                : [value]

            for (const cookie of cookies) {
              reply.raw.appendHeader('set-cookie', cookie)
            }
          } else {
            reply.header(key, value)
          }
        })

        reply.send(response.body ? await response.text() : null)
      } catch (error) {
        app.log.error(error)
        reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE',
        })
      }
    },
  })
}
