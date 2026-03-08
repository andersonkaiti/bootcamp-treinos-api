import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import Fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './config/env.ts'
import { auth } from './lib/auth.ts'
import { createWorkoutPlanRoute } from './routes/create-workout-plan.ts'

const app = Fastify({
  logger: true,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Bootcamp Treinos API',
      description: 'API para gerenciamento de treinos',
      version: '1.0.0',
    },
    servers: [
      {
        description: 'Localhost',
        url: `http://localhost:${env.PORT}`,
      },
    ],
  },
  transform: jsonSchemaTransform,
})

await app.register(fastifyCors, {
  origin: ['http://localhost:3000'],
  credentials: true,
})

await app.register(scalarApiReference, {
  routePrefix: '/docs',
  configuration: {
    theme: 'kepler',
    sources: [
      {
        title: 'Bootcamp Treinos API',
        slug: 'bootcamp-treinos-api',
        url: '/swagger.json',
      },
      {
        title: 'Auth API',
        slug: 'auth-api',
        url: '/api/auth/open-api/generate-schema',
      },
    ],
  },
})

app.register(createWorkoutPlanRoute)

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/swagger.json',
  schema: {
    hide: true,
  },
  handler: () => {
    return app.swagger()
  },
})

app.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`)

      const headers = new Headers()
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString())
      })

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      })

      const response = await auth.handler(req)

      reply.status(response.status)
      response.headers.forEach((value, key) => {
        reply.header(key, value)
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

try {
  await app.listen({ port: env.PORT }, () => {
    console.log(`Server running at http://localhost:${env.PORT}`)
  })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
