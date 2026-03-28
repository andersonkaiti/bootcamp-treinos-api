import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import type { WeekDay } from '../generated/prisma/enums'
import { prisma } from '../lib/db'

dayjs.extend(utc)

interface InputDTO {
  userId: string
  from: Date
  to: Date
}

interface OutputDTO {
  workoutStreak: number
  consistencyByDay: {
    [key: string]: {
      workoutDayCompleted: boolean
      workoutDayStarted: boolean
    }
  }
  completedWorkoutsCount: number
  conclusionRate: number
  totalTimeInSeconds: number
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

export class GetStats {
  async execute({ userId, from, to }: InputDTO): Promise<OutputDTO> {
    const fromDate = dayjs.utc(from).startOf('day')
    const toDate = dayjs.utc(to).endOf('day')

    const sessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId,
          },
        },
        startedAt: {
          gte: fromDate.toDate(),
          lte: toDate.toDate(),
        },
      },
    })

    const consistencyByDay: OutputDTO['consistencyByDay'] = {}
    let completedWorkoutsCount = 0
    let totalTimeInSeconds = 0

    for (const session of sessions) {
      const dateKey = dayjs.utc(session.startedAt).format('YYYY-MM-DD')

      if (!consistencyByDay[dateKey]) {
        consistencyByDay[dateKey] = {
          workoutDayStarted: false,
          workoutDayCompleted: false,
        }
      }

      consistencyByDay[dateKey].workoutDayStarted = true

      if (session.completedAt) {
        consistencyByDay[dateKey].workoutDayCompleted = true
        completedWorkoutsCount++
        const duration = dayjs(session.completedAt).diff(
          session.startedAt,
          'second',
        )
        totalTimeInSeconds += Math.max(0, duration)
      }
    }

    const totalSessions = sessions.length
    const conclusionRate =
      totalSessions > 0 ? completedWorkoutsCount / totalSessions : 0

    // Workout Streak logic (reusing and adapting from GetHomeData)
    const activePlan = await prisma.workoutPlan.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        workoutDays: true,
      },
    })

    const allCompletedSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlan: {
            userId,
          },
        },
        completedAt: { not: null },
      },
      select: { startedAt: true },
    })

    const completedDates = new Set(
      allCompletedSessions.map((s) =>
        dayjs.utc(s.startedAt).format('YYYY-MM-DD'),
      ),
    )

    let workoutStreak = 0

    if (completedDates.size > 0) {
      const today = dayjs.utc().startOf('day')
      const sortedDates = Array.from(completedDates).sort((a, b) =>
        b.localeCompare(a),
      )
      const maxCompletedDate = dayjs.utc(sortedDates[0])

      let checkDate = maxCompletedDate.isAfter(today) ? maxCompletedDate : today

      while (true) {
        const dateKey = checkDate.format('YYYY-MM-DD')
        const dayOfWeek = checkDate.day()
        const weekDayEnum = weekdayToEnum[dayOfWeek]

        const isRestDay =
          activePlan?.workoutDays.find((d) => d.weekDay === weekDayEnum)
            ?.isRest ?? false
        const isCompleted = completedDates.has(dateKey)

        if (isCompleted) {
          workoutStreak++
          checkDate = checkDate.subtract(1, 'day')
        } else if (isRestDay) {
          checkDate = checkDate.subtract(1, 'day')
        } else {
          // If it's today and not completed/rest, just skip it and check yesterday
          if (checkDate.isSame(today)) {
            checkDate = checkDate.subtract(1, 'day')
          } else {
            break
          }
        }

        if (workoutStreak > 365) {
          break
        }
      }
    }

    return {
      workoutStreak,
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate,
      totalTimeInSeconds,
    }
  }
}
