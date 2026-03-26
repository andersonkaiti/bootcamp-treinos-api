import { prisma } from '../lib/db'

interface InputDto {
  userId: string
  weightInGrams: number
  heightInCentimeters: number
  age: number
  bodyFatPercentage: number
}

export class UpsertUserTrainData {
  async execute(input: InputDto) {
    const user = await prisma.user.update({
      where: { id: input.userId },
      data: {
        weightInGrams: input.weightInGrams,
        heightInCentimeters: input.heightInCentimeters,
        age: input.age,
        bodyFatPercentage: input.bodyFatPercentage,
      },
    })

    return {
      userId: user.id,
      weightInGrams: user.weightInGrams ?? 0,
      heightInCentimeters: user.heightInCentimeters ?? 0,
      age: user.age ?? 0,
      bodyFatPercentage: user.bodyFatPercentage ?? 0,
    }
  }
}
