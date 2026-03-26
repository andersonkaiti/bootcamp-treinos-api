import fastifySwagger from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import {
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '../config/env'

async function swaggerIntegrations(app: FastifyInstance) {
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
}

export const swaggerIntegrationsPlugin = fastifyPlugin(swaggerIntegrations)
