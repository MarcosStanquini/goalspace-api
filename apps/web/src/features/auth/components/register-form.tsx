import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { authApi } from '../api'

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Como podemos te chamar?'),
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Use pelo menos 6 caracteres'),
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterValues) {
    try {
      await authApi.register(values)
      onSuccess()
    } catch (error) {
      const conflict =
        error instanceof Error && 'status' in error && error.status === 409
      setError(conflict ? 'email' : 'root', {
        message: conflict
          ? 'Este e-mail já está cadastrado.'
          : (error as Error).message,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>
      {errors.root && (
        <p role="alert" className="text-destructive text-sm">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  )
}
