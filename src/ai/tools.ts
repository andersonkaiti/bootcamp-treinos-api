import type { ToolSet } from 'ai'
import { tool } from 'ai'
import { z } from 'zod'
import { WeekDay } from '../generated/prisma/enums'
import { AddWorkoutDay } from '../use-cases/add-workout-day'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan'
import { GetUserTrainData } from '../use-cases/get-user-train-data'
import { ListWorkoutPlans } from '../use-cases/list-workout-plans'
import { RemoveWorkoutDay } from '../use-cases/remove-workout-day'
import { UpdateWorkoutPlan } from '../use-cases/update-workout-plan'
import { UpsertUserTrainData } from '../use-cases/upsert-user-train-data'

export function getTools(userId: string): ToolSet {
  return {
    getUserTrainData: tool({
      description:
        'Busca os dados de treino do usuário autenticado (peso, altura, idade, % gordura). Retorna hasTrainData: false se não houver dados cadastrados.',
      inputSchema: z.object({}),
      execute: async () => {
        const getUserTrainData = new GetUserTrainData()
        const result = await getUserTrainData.execute(userId)
        if (!result) return { hasTrainData: false }
        return { hasTrainData: true, ...result }
      },
    }),

    updateUserTrainData: tool({
      description:
        'Atualiza os dados do usuário autenticado (físicos e preferências). O peso deve ser em gramas (converter kg * 1000).',
      inputSchema: z.object({
        weightInGrams: z
          .number()
          .optional()
          .describe('Peso do usuário em gramas (ex: 70kg = 70000)'),
        heightInCentimeters: z
          .number()
          .optional()
          .describe('Altura do usuário em centímetros'),
        age: z.number().optional().describe('Idade do usuário'),
        bodyFatPercentage: z
          .number()
          .int()
          .min(0)
          .max(100)
          .optional()
          .describe('Percentual de gordura corporal (0 a 100)'),
        goal: z
          .string()
          .optional()
          .describe(
            'Objetivo do treino (ex: emagrecimento, hipertrofia, força)',
          ),
        availableDays: z
          .array(z.string())
          .optional()
          .describe(
            'Dias da semana disponíveis (ex: ["MONDAY", "WEDNESDAY", "FRIDAY"])',
          ),
        physicalLimitations: z
          .string()
          .optional()
          .describe('Limitações físicas ou lesões (ex: "tendinite no ombro")'),
      }),
      execute: async (params) => {
        const upsertUserTrainData = new UpsertUserTrainData()
        return upsertUserTrainData.execute({ userId, ...params })
      },
    }),

    getWorkoutPlans: tool({
      description: 'Lista todos os planos de treino do usuário autenticado.',
      inputSchema: z.object({}),
      execute: async () => {
        const listWorkoutPlans = new ListWorkoutPlans()
        return listWorkoutPlans.execute({ userId })
      },
    }),

    createWorkoutPlan: tool({
      description:
        'Cria um novo plano de treino completo para o usuário ou atualiza um existente se o planId for fornecido. Requer 7 dias (MONDAY a SUNDAY) na criação.',
      inputSchema: z.object({
        planId: z
          .string()
          .uuid()
          .optional()
          .describe(
            'ID do plano a atualizar (opcional). Se fornecido, atualiza o plano em vez de criar um novo.',
          ),
        name: z.string().describe('Nome do plano de treino'),
        workoutDays: z
          .array(
            z.object({
              id: z
                .string()
                .uuid()
                .optional()
                .describe(
                  'ID do dia de treino (obrigatório para atualizar dias existentes)',
                ),
              name: z
                .string()
                .describe('Nome do dia (ex: Peito e Tríceps, Descanso)'),
              weekDay: z.enum(WeekDay).describe('Dia da semana'),
              isRest: z
                .boolean()
                .describe('Se é dia de descanso (true) ou treino (false)'),
              estimatedDurationInSeconds: z
                .number()
                .describe(
                  'Duração estimada em segundos (0 para dias de descanso)',
                ),
              coverImageUrl: z
                .url()
                .optional()
                .describe(
                  'URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia.',
                ),
              exercises: z
                .array(
                  z.object({
                    id: z
                      .string()
                      .uuid()
                      .optional()
                      .describe(
                        'ID do exercício (obrigatório para atualizar exercícios existentes)',
                      ),
                    order: z.number().describe('Ordem do exercício no dia'),
                    name: z.string().describe('Nome do exercício'),
                    sets: z.number().describe('Número de séries'),
                    reps: z.number().describe('Número de repetições'),
                    restTimeInSeconds: z
                      .number()
                      .describe('Tempo de descanso entre séries em segundos'),
                  }),
                )
                .describe('Lista de exercícios (vazia para dias de descanso)'),
            }),
          )
          .describe('Array com exatamente 7 dias de treino (MONDAY a SUNDAY)'),
      }),
      execute: async (input) => {
        if (input.planId) {
          const updateWorkoutPlan = new UpdateWorkoutPlan()
          return updateWorkoutPlan.execute({
            userId,
            planId: input.planId,
            name: input.name,
            workoutDays: input.workoutDays,
          })
        } else {
          const createWorkoutPlan = new CreateWorkoutPlan()
          return createWorkoutPlan.execute({
            userId,
            name: input.name,
            workoutDays: input.workoutDays,
          })
        }
      },
    }),

    addWorkoutDay: tool({
      description: 'Adiciona um novo dia de treino ao plano ativo atual.',
      inputSchema: z.object({
        name: z.string().describe('Nome do dia (ex: Peito e Tríceps)'),
        weekDay: z.enum(WeekDay).describe('Dia da semana'),
        isRest: z
          .boolean()
          .optional()
          .default(false)
          .describe('Se é dia de descanso (true) ou treino (false)'),
        estimatedDurationInSeconds: z
          .number()
          .describe('Duração estimada em segundos (0 para dias de descanso)'),
        coverImageUrl: z
          .url()
          .optional()
          .describe('URL da imagem de capa do dia de treino'),
        exercises: z
          .array(
            z.object({
              order: z.number().describe('Ordem do exercício no dia'),
              name: z.string().describe('Nome do exercício'),
              sets: z.number().describe('Número de séries'),
              reps: z.number().describe('Número de repetições'),
              restTimeInSeconds: z
                .number()
                .describe('Tempo de descanso entre séries em segundos'),
            }),
          )
          .optional()
          .default([])
          .describe('Lista de exercícios (vazia para dias de descanso)'),
      }),
      execute: async (input) => {
        const listWorkoutPlans = new ListWorkoutPlans()
        const plans = await listWorkoutPlans.execute({ userId, active: true })
        if (!plans.length) {
          return { error: 'Nenhum plano de treino ativo encontrado. Crie um plano primeiro.' }
        }
        const activePlan = plans[0]
        const addWorkoutDay = new AddWorkoutDay()
        return addWorkoutDay.execute({
          userId,
          planId: activePlan.id,
          name: input.name,
          weekDay: input.weekDay,
          isRest: input.isRest,
          estimatedDurationInSeconds: input.estimatedDurationInSeconds,
          coverImageUrl: input.coverImageUrl,
          exercises: input.exercises,
        })
      },
    }),

    removeWorkoutDay: tool({
      description:
        'Remove um dia de treino do plano ativo. Também remove todos os exercícios desse dia.',
      inputSchema: z.object({
        dayId: z.string().uuid().describe('ID do dia a remover'),
      }),
      execute: async (input) => {
        const listWorkoutPlans = new ListWorkoutPlans()
        const plans = await listWorkoutPlans.execute({ userId, active: true })
        if (!plans.length) {
          return { error: 'Nenhum plano de treino ativo encontrado.' }
        }
        const activePlan = plans[0]
        const removeWorkoutDay = new RemoveWorkoutDay()
        await removeWorkoutDay.execute({
          userId,
          planId: activePlan.id,
          dayId: input.dayId,
        })
        return { success: true }
      },
    }),
  }
}
