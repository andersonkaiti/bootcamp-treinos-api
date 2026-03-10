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

export const getWorkoutPlanResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.string().uuid(),
      weekDay: z.enum(WeekDay),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.string().url().optional().nullable(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
})

export const getWorkoutDayResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.string().url().optional().nullable(),
  estimatedDurationInSeconds: z.number(),
  exercises: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      order: z.number(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
      workoutDayId: z.string().uuid(),
    }),
  ),
  weekDay: z.enum(WeekDay),
  sessions: z.array(
    z.object({
      id: z.string().uuid(),
      workoutDayId: z.string().uuid(),
      startedAt: z.date().optional().nullable(),
      completedAt: z.date().optional().nullable(),
    }),
  ),
})

export const getStatsQuerySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
})

export const getStatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.iso.date(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
})
