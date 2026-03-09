import { NotFoundError } from '../errors/not-found.ts'
import { UnauthorizedError } from '../errors/unauthorized.ts'
import { prisma } from '../lib/db.ts'

interface InputDTO {
  userId: string
  workoutPlanId: string
  workoutDayId: string
  sessionId: string
  completedAt: string
}

interface OutputDTO {
  id: string
  startedAt: Date
  completedAt: Date
}

export class CompleteWorkoutSession {
  async execute({
    userId,
    workoutPlanId,
    workoutDayId,
    sessionId,
    completedAt,
  }: InputDTO): Promise<OutputDTO> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: {
        id: workoutPlanId,
      },
    })

    if (!workoutPlan) {
      throw new NotFoundError('Workout plan not found')
    }

    if (workoutPlan.userId !== userId) {
      throw new UnauthorizedError('You are not the owner of this workout plan')
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: {
        id: workoutDayId,
        workoutPlanId,
      },
    })

    if (!workoutDay) {
      throw new NotFoundError('Workout day not found for this plan')
    }

    const workoutSession = await prisma.workoutSession.findUnique({
      where: {
        id: sessionId,
        workoutDayId,
      },
    })

    if (!workoutSession) {
      throw new NotFoundError('Workout session not found for this day')
    }

    const updatedSession = await prisma.workoutSession.update({
      where: {
        id: sessionId,
      },
      data: {
        completedAt: new Date(completedAt),
      },
    })

    return {
      id: updatedSession.id,
      startedAt: updatedSession.startedAt,
      completedAt: updatedSession.completedAt as Date,
    }
  }
}
