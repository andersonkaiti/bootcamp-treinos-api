import Fastify from 'fastify'
import { env } from './config/env.js'

const fastify = Fastify({
  logger: true,
})

fastify.get('/', async function handler(request, reply) {
  return { hello: 'world' }
})

try {
  await fastify.listen({ port: env.PORT }, () => {
    console.log(`Server running at http://localhost:${env.PORT}`)
  })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
