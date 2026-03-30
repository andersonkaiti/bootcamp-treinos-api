import { NotFoundError } from '../errors/not-found'
import { UnauthorizedError } from '../errors/unauthorized'
import type { WeekDay } from '../generated/prisma/enums'
import { prisma } from '../lib/db'

interface InputDTO {
  userId: string
  planId: string
  name: string
  weekDay: WeekDay
  isRest: boolean
  estimatedDurationInSeconds: number
  coverImageUrl?: string
  exercises: {
    name: string
    sets: number
    reps: number
    restTimeInSeconds: number
    order: number
  }[]
}

interface OutputDTO {
  id: string
  name: string
  weekDay: WeekDay
  isRest: boolean
  estimatedDurationInSeconds: number
  coverImageUrl: string | null
  exercisesCount: number
}

export class AddWorkoutDay {
  async execute(dto: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.planId },
      include: {
        workoutDays: true,
      },
    })

    if (!workoutPlan) {
      throw new NotFoundError('Workout plan not found')
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new UnauthorizedError('Unauthorized')
    }

    return prisma.$transaction(async (tx) => {
      const existingDayWithSameWeekDay = workoutPlan.workoutDays.find(
        (d) => d.weekDay === dto.weekDay,
      )

      if (existingDayWithSameWeekDay) {
        await tx.workoutDay.delete({
          where: { id: existingDayWithSameWeekDay.id },
        })
      }

      const day = await tx.workoutDay.create({
        data: {
          name: dto.name,
          weekDay: dto.weekDay,
          isRest: dto.isRest,
          estimatedDurationInSeconds: dto.estimatedDurationInSeconds,
          coverImageUrl: dto.coverImageUrl,
          workoutPlanId: dto.planId,
          exercises: {
            create: dto.exercises.map((exercise) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              restTimeInSeconds: exercise.restTimeInSeconds,
              order: exercise.order,
            })),
          },
        },
        include: {
          exercises: true,
        },
      })

      return {
        id: day.id,
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        coverImageUrl: day.coverImageUrl,
        exercisesCount: day.exercises.length,
      }
    })
  }
}
