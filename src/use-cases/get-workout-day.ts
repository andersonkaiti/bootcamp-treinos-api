import { ForbiddenError } from '../errors/forbidden-error'
import { NotFoundError } from '../errors/not-found'
import type { WeekDay } from '../generated/prisma/enums'
import { prisma } from '../lib/db'

interface InputDTO {
  userId: string
  workoutPlanId: string
  workoutDayId: string
}

interface OutputDTO {
  id: string
  name: string
  isRest: boolean
  coverImageUrl?: string | null
  estimatedDurationInSeconds: number
  exercisesCount: number
  exercises: Array<{
    id: string
    name: string
    order: number
    sets: number
    reps: number
    restTimeInSeconds: number
    workoutDayId: string
  }>
  weekDay: WeekDay
  sessions: Array<{
    id: string
    workoutDayId: string
    startedAt: Date | null
    completedAt: Date | null
  }>
}

export class GetWorkoutDay {
  async execute({
    userId,
    workoutPlanId,
    workoutDayId,
  }: InputDTO): Promise<OutputDTO> {
    const workoutDay = await prisma.workoutDay.findUnique({
      where: {
        id: workoutDayId,
        workoutPlanId,
      },
      include: {
        workoutPlan: {
          select: {
            userId: true,
          },
        },
        exercises: true,
        sessions: {
          orderBy: {
            startedAt: 'desc',
          },
        },
      },
    })

    if (!workoutDay) {
      throw new NotFoundError('Workout day not found')
    }

    if (workoutDay.workoutPlan.userId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to access this workout day',
      )
    }

    return {
      id: workoutDay.id,
      name: workoutDay.name,
      isRest: workoutDay.isRest,
      coverImageUrl: workoutDay.coverImageUrl,
      estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
      exercisesCount: workoutDay.exercises.length,
      exercises: workoutDay.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        restTimeInSeconds: exercise.restTimeInSeconds,
        workoutDayId: exercise.workoutDayId,
        exerciseCount: workoutDay.exercises.length,
      })),
      weekDay: workoutDay.weekDay,
      sessions: workoutDay.sessions.map((session) => ({
        id: session.id,
        workoutDayId: session.workoutDayId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      })),
    }
  }
}
