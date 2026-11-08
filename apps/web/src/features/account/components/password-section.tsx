import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useUpdatePassword } from '../queries'
import { SettingsSection } from './settings-section'

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Informe a senha atual'),
  new_password: z.string().min(6, 'Use pelo menos 6 caracteres'),
})

type PasswordValues = z.infer<typeof passwordSchema>

export function PasswordSection() {
  const updatePassword = useUpdatePassword()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  function onSubmit(values: PasswordValues) {
    updatePassword.mutate(values, {
      onSuccess: () => {
        reset({ current_password: '', new_password: '' })
        toast.success('Senha alterada')
      },
      onError: () =>
        setError('current_password', { message: 'Senha atual incorreta' }),
    })
  }

  return (
    <SettingsSection title="Senha" description="Use pelo menos 6 caracteres.">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-md gap-4"
        noValidate
      >
        <div className="grid gap-1.5">
          <Label htmlFor="current-password">Senha atual</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.current_password)}
            {...register('current_password')}
          />
          {errors.current_password && (
            <p className="text-destructive text-xs">
              {errors.current_password.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.new_password)}
            {...register('new_password')}
          />
          {errors.new_password && (
            <p className="text-destructive text-xs">
              {errors.new_password.message}
            </p>
          )}
        </div>
        <div>
          <Button
            type="submit"
            variant="outline"
            disabled={updatePassword.isPending}
          >
            Alterar senha
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
