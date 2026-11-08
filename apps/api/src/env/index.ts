import 'dotenv/config'
import { z } from 'zod'

// Cria o schema de validação
const envSchema = z.object({
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333), // O coerce ele converte para number
  DATABASE_URL: z.string().url(),
  EVOLUTION_API_URL: z.string().url().default('http://localhost:8080'),
  EVOLUTION_API_KEY: z.string(),
  // Lista separada por vírgula com as origens liberadas (ex: http://localhost:5173). "*" libera todas.
  CORS_ORIGIN: z.string().default('*'),
  // Pasta do front buildado (ex.: ../web/dist). Se definida, a API serve o front.
  WEB_DIST: z.string().optional(),
})

// Faz a validação:
const _env = envSchema.safeParse(process.env) // Safe Parse nao lança um erro, retorna so um true/false

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables') // Lança um erro para derrubar a aplicação
}

export const env = _env.data
