import { app } from './app'
import { env } from './env/index'
import './jobs/reminder-before-1h'
import './jobs/reminder-before-24h'
import './jobs/achievement-alert'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => console.log('🚀 Running!'))
