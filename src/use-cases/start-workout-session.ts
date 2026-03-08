import { ConflictError } from '../errors/conflict-error.ts'
import { NotFoundError } from '../errors/not-found.ts'
import { UnauthorizedError } from '../errors/unauthorized.ts'
import { WorkoutPlanNotActiveError } from '../errors/workout-plan-not-active-error.ts'
import { prisma } from '../lib/db.ts'

interface InputDTO {
  userId: string
  workoutPlanId: string
  workoutDayId: string
}

interface OutputDTO {
  userWorkoutSessionId: string
}

export class StartWorkoutSession {
  async execute({
    userId,
    workoutPlanId,
    workoutDayId,
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

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError()
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

    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        workoutDayId,
        completedAt: null,
      },
    })

    if (existingSession) {
      throw new ConflictError(
        'A session is already in progress for this workout day',
      )
    }

    const workoutSession = await prisma.workoutSession.create({
      data: {
        workoutDayId,
        startedAt: new Date(),
      },
    })

    return {
      userWorkoutSessionId: workoutSession.id,
    }
  }
}
