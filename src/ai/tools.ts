import type { ToolSet } from 'ai'
import { tool } from 'ai'
import { z } from 'zod'
import { WeekDay } from '../generated/prisma/enums'
import { CreateWorkoutPlan } from '../use-cases/create-workout-plan'
import { GetUserTrainData } from '../use-cases/get-user-train-data'
import { ListWorkoutPlans } from '../use-cases/list-workout-plans'
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
        'Atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas (converter kg * 1000).',
      inputSchema: z.object({
        weightInGrams: z
          .number()
          .describe('Peso do usuário em gramas (ex: 70kg = 70000)'),
        heightInCentimeters: z
          .number()
          .describe('Altura do usuário em centímetros'),
        age: z.number().describe('Idade do usuário'),
        bodyFatPercentage: z
          .number()
          .int()
          .min(0)
          .max(100)
          .describe('Percentual de gordura corporal (0 a 100)'),
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
      description: 'Cria um novo plano de treino completo para o usuário.',
      inputSchema: z.object({
        name: z.string().describe('Nome do plano de treino'),
        workoutDays: z
          .array(
            z.object({
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
                .describe(
                  'URL da imagem de capa do dia de treino. Usar as URLs de superior ou inferior conforme o foco muscular do dia.',
                ),
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
                .describe('Lista de exercícios (vazia para dias de descanso)'),
            }),
          )
          .describe('Array com exatamente 7 dias de treino (MONDAY a SUNDAY)'),
      }),
      execute: async (input) => {
        const createWorkoutPlan = new CreateWorkoutPlan()
        return createWorkoutPlan.execute({
          userId,
          name: input.name,
          workoutDays: input.workoutDays,
        })
      },
    }),
  }
}
