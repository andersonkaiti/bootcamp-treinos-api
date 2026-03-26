import { ForbiddenError } from '../errors/forbidden-error'
import { NotFoundError } from '../errors/not-found'
import type { WeekDay } from '../generated/prisma/enums'
import { prisma } from '../lib/db'

interface InputDTO {
  userId: string
  workoutPlanId: string
}

interface OutputDTO {
  id: string
  name: string
  workoutDays: {
    id: string
    weekDay: WeekDay
    name: string
    isRest: boolean
    coverImageUrl?: string | null
    estimatedDurationInSeconds: number
    exercisesCount: number
  }[]
}

export class GetWorkoutPlan {
  async execute({ userId, workoutPlanId }: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: workoutPlanId,
      },
      include: {
        workoutDays: {
          include: {
            _count: {
              select: {
                exercises: true,
              },
            },
          },
        },
      },
    })

    if (!workoutPlan) {
      throw new NotFoundError('Workout plan not found')
    }

    if (workoutPlan.userId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to access this workout plan',
      )
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      workoutDays: workoutPlan.workoutDays.map((day) => ({
        id: day.id,
        weekDay: day.weekDay,
        name: day.name,
        isRest: day.isRest,
        coverImageUrl: day.coverImageUrl,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        exercisesCount: day._count.exercises,
      })),
    }
  }
}
