import { NotFoundError } from '../errors/not-found'
import { UnauthorizedError } from '../errors/unauthorized'
import type { WeekDay } from '../generated/prisma/enums'
import { prisma } from '../lib/db'

interface UpdateWorkoutDayInput {
  id?: string
  name?: string
  weekDay?: WeekDay
  isRest?: boolean
  estimatedDurationInSeconds?: number
  coverImageUrl?: string
  exercises?: Array<{
    id?: string
    name?: string
    sets?: number
    reps?: number
    restTimeInSeconds?: number
    order?: number
  }>
}

interface InputDTO {
  userId: string
  planId: string
  name?: string
  workoutDays?: UpdateWorkoutDayInput[]
}

interface OutputDTO {
  id: string
  name: string
  workoutDays: {
    id: string
    name: string
    weekDay: WeekDay
    isRest: boolean
    estimatedDurationInSeconds: number
    coverImageUrl: string | null
    exercisesCount: number
  }[]
}

export class UpdateWorkoutPlan {
  async execute(dto: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: dto.planId,
      },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
    })

    if (!workoutPlan) {
      throw new NotFoundError('Workout plan not found')
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new UnauthorizedError('Unauthorized')
    }

    return prisma.$transaction(async (tx) => {
      // Update plan-level fields
      if (dto.name) {
        await tx.workoutPlan.update({
          where: {
            id: dto.planId,
          },
          data: {
            name: dto.name,
          },
        })
      }

      // Update workout days and exercises
      if (dto.workoutDays && dto.workoutDays.length > 0) {
        for (const updateDay of dto.workoutDays) {
          const existingDay = workoutPlan.workoutDays.find(
            (d) => d.id === updateDay.id,
          )

          if (existingDay) {
            // Update existing day
            const dayUpdateData: Record<string, unknown> = {}
            if (updateDay.name !== undefined) dayUpdateData.name = updateDay.name
            if (updateDay.weekDay !== undefined)
              dayUpdateData.weekDay = updateDay.weekDay
            if (updateDay.isRest !== undefined)
              dayUpdateData.isRest = updateDay.isRest
            if (updateDay.estimatedDurationInSeconds !== undefined)
              dayUpdateData.estimatedDurationInSeconds =
                updateDay.estimatedDurationInSeconds
            if (updateDay.coverImageUrl !== undefined)
              dayUpdateData.coverImageUrl = updateDay.coverImageUrl

            if (Object.keys(dayUpdateData).length > 0) {
              await tx.workoutDay.update({
                where: {
                  id: existingDay.id,
                },
                data: dayUpdateData,
              })
            }

            // Update exercises in this day
            if (updateDay.exercises && updateDay.exercises.length > 0) {
              for (const updateExercise of updateDay.exercises) {
                const existingExercise = existingDay.exercises.find(
                  (e) => e.id === updateExercise.id,
                )

                if (existingExercise) {
                  // Update existing exercise
                  const exerciseUpdateData: Record<string, unknown> = {}
                  if (updateExercise.name !== undefined)
                    exerciseUpdateData.name = updateExercise.name
                  if (updateExercise.sets !== undefined)
                    exerciseUpdateData.sets = updateExercise.sets
                  if (updateExercise.reps !== undefined)
                    exerciseUpdateData.reps = updateExercise.reps
                  if (updateExercise.restTimeInSeconds !== undefined)
                    exerciseUpdateData.restTimeInSeconds =
                      updateExercise.restTimeInSeconds
                  if (updateExercise.order !== undefined)
                    exerciseUpdateData.order = updateExercise.order

                  if (Object.keys(exerciseUpdateData).length > 0) {
                    await tx.workoutExercise.update({
                      where: {
                        id: existingExercise.id,
                      },
                      data: exerciseUpdateData,
                    })
                  }
                } else {
                  // Create new exercise (if it has a name, it's a new one)
                  if (updateExercise.name) {
                    await tx.workoutExercise.create({
                      data: {
                        name: updateExercise.name,
                        sets: updateExercise.sets ?? 3,
                        reps: updateExercise.reps ?? 10,
                        restTimeInSeconds: updateExercise.restTimeInSeconds ?? 60,
                        order: updateExercise.order ?? 0,
                        workoutDayId: existingDay.id,
                      },
                    })
                  }
                }
              }
            }
          }
        }
      }

      // Fetch updated plan
      const result = await tx.workoutPlan.findUnique({
        where: {
          id: dto.planId,
        },
        include: {
          workoutDays: {
            include: {
              exercises: true,
            },
          },
        },
      })

      if (!result) {
        throw new NotFoundError('Workout plan not found')
      }

      return {
        id: result.id,
        name: result.name,
        workoutDays: result.workoutDays.map((day) => ({
          id: day.id,
          name: day.name,
          weekDay: day.weekDay,
          isRest: day.isRest,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          coverImageUrl: day.coverImageUrl,
          exercisesCount: day.exercises.length,
        })),
      }
    })
  }
}
