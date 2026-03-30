import { NotFoundError } from '../errors/not-found'
import { UnauthorizedError } from '../errors/unauthorized'
import { prisma } from '../lib/db'

interface InputDTO {
  userId: string
  planId: string
  dayId: string
}

export class RemoveWorkoutDay {
  async execute(dto: InputDTO): Promise<void> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.planId },
    })

    if (!workoutPlan) {
      throw new NotFoundError('Workout plan not found')
    }

    if (workoutPlan.userId !== dto.userId) {
      throw new UnauthorizedError('Unauthorized')
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.dayId },
    })

    if (!workoutDay) {
      throw new NotFoundError('Workout day not found')
    }

    if (workoutDay.workoutPlanId !== dto.planId) {
      throw new UnauthorizedError('Workout day does not belong to this plan')
    }

    await prisma.workoutDay.delete({
      where: { id: dto.dayId },
    })
  }
}
