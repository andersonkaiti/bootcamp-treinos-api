import type { WeekDay } from '../generated/prisma/enums'
import { prisma } from '../lib/db'

interface InputDTO {
  userId: string
  active?: boolean
}

interface OutputDTO {
  id: string
  name: string
  isActive: boolean
  workoutDays: {
    id: string
    name: string
    isRest: boolean
    coverImageUrl?: string | null
    estimatedDurationInSeconds: number
    weekDay: WeekDay
    exercisesCount: number
    exercises: {
      id: string
      name: string
      order: number
      sets: number
      reps: number
      restTimeInSeconds: number
      workoutDayId: string
    }[]
  }[]
}

export class ListWorkoutPlans {
  async execute({ userId, active }: InputDTO): Promise<OutputDTO[]> {
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: {
        userId,
        isActive: active,
      },
      include: {
        workoutDays: {
          include: {
            exercises: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            weekDay: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return workoutPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      isActive: plan.isActive,
      workoutDays: plan.workoutDays.map((day) => ({
        id: day.id,
        name: day.name,
        isRest: day.isRest,
        coverImageUrl: day.coverImageUrl,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        weekDay: day.weekDay,
        exercisesCount: day.exercises.length,
        exercises: day.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeInSeconds: exercise.restTimeInSeconds,
          workoutDayId: exercise.workoutDayId,
        })),
      })),
    }))
  }
}
