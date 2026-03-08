import z from 'zod'
import { WeekDay } from '../generated/prisma/enums.ts'

export const errorSchema = z.object({
  error: z.string(),
  code: z.string(),
})

export const workoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      weekDay: z.enum(WeekDay),
      isRest: z.boolean().default(false),
      estimatedDurationInSeconds: z.number().min(1),
      coverImageUrl: z.url().optional(),
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
})
