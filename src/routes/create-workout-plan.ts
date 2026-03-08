import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { NotFoundError } from '../errors/not-found.ts'
import { WeekDay } from '../generated/prisma/enums.ts'
import { auth } from '../lib/auth.ts'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan.ts'

/**
 * Controller -> UseCase/Service -> Repository (Prisma ORM)
 *
 * Controller: recebe os dados da requisição e valida se eles são válidos. Não
 * é responsável por regras de negócio, mas sim por validar os tipos de dados.
 *
 * UseCase: responsável pelas regras de negócio.
 *
 * UseCase: expõe um comportamento (respeita o SRP - Single Responsibility Principle).
 * - CreateWorkoutPlanUseCase
 *
 * Service: expõe vários comportamentos (não respeita o SRP).
 * - WorkoutPlanService
 *   - create()
 *   - update()
 *
 * Repository: responsável pela persistência de dados.
 */

export async function createWorkoutPlanRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/create-workout-plan',
    schema: {
      body: z.object({
        name: z.string().trim().min(1),
        workoutDays: z.array(
          z.object({
            name: z.string().trim().min(1),
            weekDay: z.enum(WeekDay),
            isRest: z.boolean().default(false),
            estimatedDurationInSeconds: z.number().min(1),
            exercises: z.array(
              z.object({
                name: z.string().trim().min(1),
                sets: z.number().min(1),
                reps: z.number().min(1),
                restTimeInSeconds: z.number().min(1),
                order: z.number().min(0),
              }),
            ),
          }),
        ),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          name: z.string().trim().min(1),
          workoutDays: z.array(
            z.object({
              name: z.string().trim().min(1),
              weekDay: z.enum(WeekDay),
              isRest: z.boolean().default(false),
              estimatedDurationInSeconds: z.number().min(1),
              exercises: z.array(
                z.object({
                  name: z.string().trim().min(1),
                  sets: z.number().min(1),
                  reps: z.number().min(1),
                  restTimeInSeconds: z.number().min(1),
                  order: z.number().min(0),
                }),
              ),
            }),
          ),
        }),
        400: z.object({
          error: z.string(),
          code: z.string(),
        }),
        401: z.object({
          error: z.string(),
          code: z.string(),
        }),
        404: z.object({
          error: z.string(),
          code: z.string(),
        }),
        500: z.object({
          error: z.string(),
          code: z.string(),
        }),
      },
    },
    async handler(request, reply) {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })

        if (!session) {
          return reply.status(401).send({
            error: 'Unauthorized',
            code: 'UNAUTHORIZED',
          })
        }

        const createWorkoutPlan = new CreateWorkoutPlan()

        const { name, workoutDays } = request.body

        const result = await createWorkoutPlan.execute({
          userId: session.user.id,
          name,
          workoutDays,
        })

        return reply.status(201).send(result)
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: 'NOT_FOUND_ERROR',
          })
        }

        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    },
  })
}
