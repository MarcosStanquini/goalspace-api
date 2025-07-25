import 'dotenv/config'
import { z } from 'zod'

// Cria o schema de validação
const envSchema = z.object({
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333), // O coerce ele converte para number
  EVOLUTION_API_KEY: z.string(),
})

// Faz a validação:
const _env = envSchema.safeParse(process.env) // Safe Parse nao lança um erro, retorna so um true/false

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables') // Lança um erro para derrubar a aplicação(nenhum codigo executa depois disso)
}

export const env = _env.data
