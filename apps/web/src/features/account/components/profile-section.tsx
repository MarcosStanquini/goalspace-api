import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { profileQuery, useUpdateProfile } from '../queries'
import { SettingsSection } from './settings-section'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail válido'),
})

type ProfileValues = z.infer<typeof profileSchema>

export function ProfileSection() {
  const { data: profile } = useQuery(profileQuery())
  const updateProfile = useUpdateProfile()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) reset({ name: profile.name, email: profile.email })
  }, [profile, reset])

  function onSubmit(values: ProfileValues) {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success('Perfil atualizado'),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <SettingsSection title="Perfil" description="Seu nome e e-mail de acesso.">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-md gap-4"
        noValidate
      >
        <div className="grid gap-1.5">
          <Label htmlFor="profile-name">Nome</Label>
          <Input
            id="profile-name"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="profile-email">E-mail</Label>
          <Input
            id="profile-email"
            type="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            Salvar perfil
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
