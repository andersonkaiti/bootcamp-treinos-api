import { NotFoundError } from '../errors/not-found.ts'
import type { WeekDay } from '../generated/prisma/enums.ts'
import { prisma } from '../lib/db.ts'

// Data Transfer Object (DTO): o formato do dado que trafega entre a internet e
// a aplicação.
interface IDTO {
  userId: string
  name: string
  workoutDays: {
    name: string
    weekDay: WeekDay
    isRest: boolean
    estimatedDurationInSeconds: number
    exercises: {
      name: string
      sets: number
      reps: number
      restTimeInSeconds: number
      order: number
    }[]
  }[]
}

export class CreateWorkoutPlan {
  async execute(dto: IDTO) {
    const existingWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        isActive: true,
      },
    })

    // Transaction -> Atomicidade -> ou tudo ou nada

    return prisma.$transaction(async (tx) => {
      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: {
            id: existingWorkoutPlan.id,
          },
          data: {
            isActive: false,
          },
        })
      }

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                  order: exercise.order,
                })),
              },
            })),
          },
        },
      })

      const result = await tx.workoutPlan.findUnique({
        where: {
          id: workoutPlan.id,
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
          name: day.name,
          weekDay: day.weekDay,
          isRest: day.isRest,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          exercises: day.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restTimeInSeconds: exercise.restTimeInSeconds,
            order: exercise.order,
          })),
        })),
      }
    })
  }
}
