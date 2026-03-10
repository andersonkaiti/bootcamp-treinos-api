import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from './config/env.ts'
import { errorHandler } from './error-handler.ts'
import { swaggerIntegrationsPlugin } from './lib/swagger.ts'
import { authRoute } from './routes/auth/index.ts'
import { getHomeDataRoute } from './routes/home/get-home-data.ts'
import { statsRoute } from './routes/stats.ts'
import { userRoutes } from './routes/user/index.ts'
import { completeWorkoutSessionRoute } from './routes/workout/complete-workout-session.ts'
import { createWorkoutPlanRoute } from './routes/workout/create-workout-plan.ts'
import { createWorkoutSessionRoute } from './routes/workout/create-workout-session.ts'
import { getWorkoutDayRoute } from './routes/workout/get-workout-day.ts'
import { getWorkoutPlanRoute } from './routes/workout/get-workout-plan.ts'

const app = Fastify({
  logger: true,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(swaggerIntegrationsPlugin)

await app.register(fastifyCors, {
  origin: ['http://localhost:3000'],
  credentials: true,
})

app.register(createWorkoutPlanRoute)
app.register(getWorkoutPlanRoute)
app.register(getWorkoutDayRoute)
app.register(createWorkoutSessionRoute)
app.register(completeWorkoutSessionRoute)
app.register(getHomeDataRoute)
app.register(statsRoute)
app.register(userRoutes)

app.register(authRoute)

try {
  await app.listen({ port: env.PORT }, () => {
    console.log(`Server running at http://localhost:${env.PORT}`)
  })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
