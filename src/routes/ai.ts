import { google } from '@ai-sdk/google'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai'
import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { SYSTEM_PROMPT } from '../ai/system.ts'
import { getTools } from '../ai/tools.ts'
import { UnauthorizedError } from '../errors/unauthorized.ts'
import { auth } from '../lib/auth.ts'

export async function aiRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/ai',
    schema: {
      operationId: 'chatWithAI',
      tags: ['AI'],
      summary: 'Chat with the virtual personal trainer',
    },
    async handler(request, reply) {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      })

      if (!session) {
        throw new UnauthorizedError('Unauthorized')
      }

      const { id: userId } = session.user

      const { messages } = request.body as { messages: UIMessage[] }

      // Realiza o streaming de texto para o front-end
      // Gemini > (token) > AI SDK > (chunk) > ReadableStream > Fastify > HTTP chunk > Frontend
      const result = streamText({
        model: google('gemini-2.0-flash'),
        system: SYSTEM_PROMPT,
        // Tool: algo que o modelo consegue executar
        tools: getTools(userId),
        stopWhen: stepCountIs(5),
        messages: await convertToModelMessages(messages),
      })

      const response = result.toUIMessageStreamResponse()

      reply.status(response.status)

      response.headers.forEach((value, key) => {
        reply.header(key, value)
      })

      return reply.send(response.body)
    },
  })
}
