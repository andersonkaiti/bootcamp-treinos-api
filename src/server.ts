import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'
import { env } from './config/env.js'

const app = Fastify({
  logger: true,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.withTypeProvider<ZodTypeProvider>().route({
  method: 'GET',
  url: '/',
  schema: {
    description: 'Hello, World!',
    tags: ['Hello, World!'],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: (_request, _reply) => {
    return {
      message: 'Hello, World!',
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
