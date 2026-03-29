import z from 'zod'
import { WeekDay } from '../generated/prisma/enums'

export const errorSchema = z.object({
  error: z.string(),
  code: z.string(),
})

/*
|--------------------------------------------------------------------------
| Base Entities
|--------------------------------------------------------------------------
*/

const exerciseSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  order: z.number().min(0),
  sets: z.number().min(1),
  reps: z.number().min(1),
  restTimeInSeconds: z.number().min(1),
})

const workoutDayBaseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  weekDay: z.enum(WeekDay),
  isRest: z.boolean(),
  estimatedDurationInSeconds: z.number(),
  coverImageUrl: z.url().nullable().optional(),
  exercisesCount: z.number(),
})

const workoutPlanBaseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

/*
|--------------------------------------------------------------------------
| Derived WorkoutDay Schemas
|--------------------------------------------------------------------------
*/

const workoutDayWithExercisesSchema = workoutDayBaseSchema.extend({
  exercises: z.array(
    exerciseSchema.extend({
      workoutDayId: z.uuid(),
    }),
  ),
})

/*
|--------------------------------------------------------------------------
| Workout Plan Creation
|--------------------------------------------------------------------------
*/

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

export const updateWorkoutPlanBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  workoutDays: z
    .array(
      z.object({
        id: z.uuid().optional(),
        name: z.string().trim().min(1).optional(),
        weekDay: z.enum(WeekDay).optional(),
        isRest: z.boolean().optional(),
        estimatedDurationInSeconds: z.number().min(1).optional(),
        coverImageUrl: z.url().optional(),
        exercises: z
          .array(
            z.object({
              id: z.uuid().optional(),
              name: z.string().trim().min(1).optional(),
              sets: z.number().min(1).optional(),
              reps: z.number().min(1).optional(),
              restTimeInSeconds: z.number().min(1).optional(),
              order: z.number().min(0).optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
})

/*
|--------------------------------------------------------------------------
| Workout Plan Responses
|--------------------------------------------------------------------------
*/

export const getWorkoutPlanResponseSchema = workoutPlanBaseSchema.extend({
  workoutDays: z.array(workoutDayBaseSchema),
})

export const listWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
})

export const listWorkoutPlansResponseSchema = z.array(
  workoutPlanBaseSchema.extend({
    isActive: z.boolean(),
    workoutDays: z.array(workoutDayWithExercisesSchema),
  }),
)

/*
|--------------------------------------------------------------------------
| Workout Day Responses
|--------------------------------------------------------------------------
*/

export const getWorkoutDayResponseSchema = workoutDayWithExercisesSchema.extend(
  {
    sessions: z.array(
      z.object({
        id: z.uuid(),
        workoutDayId: z.uuid(),
        startedAt: z.coerce.date().nullable().optional(),
        completedAt: z.coerce.date().nullable().optional(),
      }),
    ),
  },
)

/*
|--------------------------------------------------------------------------
| Home
|--------------------------------------------------------------------------
*/

export const getHomeDataParamsSchema = z.object({
  date: z.coerce.date(),
})

export const getHomeDataResponseSchema = z.object({
  activeWorkoutPlanId: z.uuid().nullable(),
  todayWorkoutDay: workoutDayBaseSchema
    .extend({
      workoutPlanId: z.uuid(),
    })
    .nullable(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(
    z.string(),
    z.object({
      workoutDayCompleted: z.boolean(),
      workoutDayStarted: z.boolean(),
    }),
  ),
})

/*
|--------------------------------------------------------------------------
| Stats
|--------------------------------------------------------------------------
*/

export const getStatsQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
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

/*
|--------------------------------------------------------------------------
| User Train Data
|--------------------------------------------------------------------------
*/

export const getUserTrainDataResponseSchema = z
  .object({
    userId: z.string(),
    userName: z.string(),
    weightInGrams: z.number(),
    heightInCentimeters: z.number(),
    age: z.number(),
    bodyFatPercentage: z.number().int().min(0).max(100),
    goal: z.string().nullable().optional(),
    availableDays: z.array(z.string()).optional(),
    physicalLimitations: z.string().nullable().optional(),
  })
  .nullable()

export const upsertUserTrainDataBodySchema = z.object({
  weightInGrams: z.number().min(1).optional(),
  heightInCentimeters: z.number().min(1).optional(),
  age: z.number().min(1).optional(),
  bodyFatPercentage: z.number().int().min(0).max(100).optional(),
  goal: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  physicalLimitations: z.string().optional(),
})

export const upsertUserTrainDataResponseSchema = z.object({
  userId: z.string(),
  weightInGrams: z.number(),
  heightInCentimeters: z.number(),
  age: z.number(),
  bodyFatPercentage: z.number().int().min(0).max(100),
  goal: z.string().nullable().optional(),
  availableDays: z.array(z.string()).optional(),
  physicalLimitations: z.string().nullable().optional(),
})
