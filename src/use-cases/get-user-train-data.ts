import { prisma } from '../lib/db'

interface OutputDto {
  userId: string
  userName: string
  weightInGrams: number
  heightInCentimeters: number
  age: number
  bodyFatPercentage: number
  goal?: string | null
  availableDays?: string[]
  physicalLimitations?: string | null
}

export class GetUserTrainData {
  async execute(userId: string): Promise<OutputDto | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        weightInGrams: true,
        heightInCentimeters: true,
        age: true,
        bodyFatPercentage: true,
        goal: true,
        availableDays: true,
        physicalLimitations: true,
      },
    })

    if (
      !user ||
      user.weightInGrams === null ||
      user.heightInCentimeters === null ||
      user.age === null ||
      user.bodyFatPercentage === null
    ) {
      return null
    }

    return {
      userId: user.id,
      userName: user.name,
      weightInGrams: user.weightInGrams,
      heightInCentimeters: user.heightInCentimeters,
      age: user.age,
      bodyFatPercentage: user.bodyFatPercentage,
      goal: user.goal,
      availableDays: user.availableDays,
      physicalLimitations: user.physicalLimitations,
    }
  }
}
