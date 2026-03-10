import { prisma } from '../lib/db.ts'

interface OutputDto {
  userId: string
  userName: string
  weightInGrams: number
  heightInCentimeters: number
  age: number
  bodyFatPercentage: number
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
      },
    })

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      userName: user.name,
      weightInGrams: user.weightInGrams ?? 0,
      heightInCentimeters: user.heightInCentimeters ?? 0,
      age: user.age ?? 0,
      bodyFatPercentage: user.bodyFatPercentage ?? 0,
    }
  }
}
