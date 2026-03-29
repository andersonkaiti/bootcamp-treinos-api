import { prisma } from '../lib/db'

interface InputDto {
  userId: string
  weightInGrams?: number
  heightInCentimeters?: number
  age?: number
  bodyFatPercentage?: number
  goal?: string
  availableDays?: string[]
  physicalLimitations?: string
}

export class UpsertUserTrainData {
  async execute(input: InputDto) {
    const data: Record<string, unknown> = {}

    if (input.weightInGrams !== undefined) {
      data.weightInGrams = input.weightInGrams
    }
    if (input.heightInCentimeters !== undefined) {
      data.heightInCentimeters = input.heightInCentimeters
    }
    if (input.age !== undefined) {
      data.age = input.age
    }
    if (input.bodyFatPercentage !== undefined) {
      data.bodyFatPercentage = input.bodyFatPercentage
    }
    if (input.goal !== undefined) {
      data.goal = input.goal
    }
    if (input.availableDays !== undefined) {
      data.availableDays = input.availableDays
    }
    if (input.physicalLimitations !== undefined) {
      data.physicalLimitations = input.physicalLimitations
    }

    const user = await prisma.user.update({
      where: { id: input.userId },
      data,
    })

    return {
      userId: user.id,
      weightInGrams: user.weightInGrams ?? 0,
      heightInCentimeters: user.heightInCentimeters ?? 0,
      age: user.age ?? 0,
      bodyFatPercentage: user.bodyFatPercentage ?? 0,
      goal: user.goal,
      availableDays: user.availableDays,
      physicalLimitations: user.physicalLimitations,
    }
  }
}
