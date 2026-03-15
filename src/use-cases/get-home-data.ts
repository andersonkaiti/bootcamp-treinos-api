import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import type { WeekDay } from '../generated/prisma/enums.ts'
import { prisma } from '../lib/db.ts'

dayjs.extend(utc)

interface InputDTO {
  userId: string
  date: Date
}

interface OutputDTO {
  activeWorkoutPlanId: string | null
  todayWorkoutDay: {
    workoutPlanId: string
    id: string
    name: string
    isRest: boolean
    weekDay: WeekDay
    estimatedDurationInSeconds: number
    coverImageUrl?: string | null
    exercisesCount: number
  } | null
  workoutStreak: number
  consistencyByDay: {
    [key: string]: {
      workoutDayCompleted: boolean
      workoutDayStarted: boolean
    }
  }
}

const weekdayToEnum: Record<number, WeekDay> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

export class GetHomeData {
  async execute({ userId, date }: InputDTO): Promise<OutputDTO> {
    const requestedDate = dayjs.utc(date).startOf('day')
    const startOfWeek = requestedDate.startOf('week')
    const endOfWeek = requestedDate.endOf('week')

    const activePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: {
            _count: {
              select: { exercises: true },
            },
          },
        },
      },
    })

    let todayWorkoutDay: OutputDTO['todayWorkoutDay'] = null
    if (activePlan) {
      const dayOfWeek = requestedDate.day()
      const currentWeekDayEnum = weekdayToEnum[dayOfWeek]

      const dayPlan = activePlan.workoutDays.find(
        (day) => day.weekDay === currentWeekDayEnum,
      )

      if (dayPlan) {
        todayWorkoutDay = {
          workoutPlanId: dayPlan.workoutPlanId,
          id: dayPlan.id,
          name: dayPlan.name,
          isRest: dayPlan.isRest,
          weekDay: dayPlan.weekDay,
          estimatedDurationInSeconds: dayPlan.estimatedDurationInSeconds,
          coverImageUrl: dayPlan.coverImageUrl,
          exercisesCount: dayPlan._count.exercises,
        }
      }
    }

    const weeklySessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId,
          },
        },
        startedAt: {
          gte: startOfWeek.toDate(),
          lte: endOfWeek.toDate(),
        },
      },
    })

    const consistencyByDay: OutputDTO['consistencyByDay'] = {}
    for (let i = 0; i < 7; i++) {
      const currentDay = startOfWeek.add(i, 'day')
      const dateKey = currentDay.format('YYYY-MM-DD')

      const daySessions = weeklySessions.filter((s) =>
        dayjs.utc(s.startedAt).isSame(currentDay, 'day'),
      )

      consistencyByDay[dateKey] = {
        workoutDayStarted: daySessions.length > 0,
        workoutDayCompleted: daySessions.some((s) => s.completedAt !== null),
      }
    }

    let workoutStreak = 0
    let checkDate = requestedDate

    const allCompletedSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId,
          },
        },
        completedAt: { not: null },
      },
      select: { completedAt: true, startedAt: true },
    })

    const completedDates = new Set(
      allCompletedSessions.map((s) =>
        dayjs.utc(s.startedAt).format('YYYY-MM-DD'),
      ),
    )

    while (true) {
      const dateKey = checkDate.format('YYYY-MM-DD')
      const dayOfWeek = checkDate.day()
      const weekDayEnum = weekdayToEnum[dayOfWeek]

      const isRestDay =
        activePlan?.workoutDays.find((d) => d.weekDay === weekDayEnum)
          ?.isRest ?? false
      const isCompleted = completedDates.has(dateKey)

      if (isCompleted || isRestDay) {
        workoutStreak++
        checkDate = checkDate.subtract(1, 'day')
      } else {
        break
      }

      if (workoutStreak > 365) {
        break
      }
    }

    return {
      activeWorkoutPlanId: activePlan?.id ?? null,
      todayWorkoutDay,
      workoutStreak,
      consistencyByDay,
    }
  }
}
