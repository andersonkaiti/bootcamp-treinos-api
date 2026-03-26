import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { env } from './config/env'
import { errorHandler } from './error-handler'
import { swaggerIntegrationsPlugin } from './lib/swagger'
import { aiRoutes } from './routes/ai'
import { authRoute } from './routes/auth/index'
import { getHomeDataRoute } from './routes/home/get-home-data'
import { statsRoute } from './routes/stats'
import { userRoutes } from './routes/user/index'
import { completeWorkoutSessionRoute } from './routes/workout/complete-workout-session'
import { createWorkoutPlanRoute } from './routes/workout/create-workout-plan'
import { createWorkoutSessionRoute } from './routes/workout/create-workout-session'
import { getWorkoutDayRoute } from './routes/workout/get-workout-day'
import { getWorkoutPlanRoute } from './routes/workout/get-workout-plan'
import { listWorkoutPlansRoute } from './routes/workout/list-workout-plans'

const app = Fastify({
  logger: true,
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(swaggerIntegrationsPlugin)

await app.register(fastifyCors, {
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
})

app.register(createWorkoutPlanRoute)
app.register(getWorkoutPlanRoute)
app.register(listWorkoutPlansRoute)
app.register(getWorkoutDayRoute)
app.register(createWorkoutSessionRoute)
app.register(completeWorkoutSessionRoute)
app.register(getHomeDataRoute)
app.register(statsRoute)
app.register(userRoutes)
app.register(aiRoutes)

app.register(authRoute)

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' }, () => {
    console.log(`Server running at http://localhost:${env.PORT}`)
  })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
