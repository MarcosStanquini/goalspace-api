import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { AuthLayout } from '@/app/auth-layout'
import { authApi, RegisterForm } from '@/features/auth'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (authApi.isAuthenticated()) throw redirect({ to: '/' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Crie sua conta"
      description="Coloque sua primeira meta em órbita em menos de um minuto."
      footer={
        <>
          Já tem conta?{' '}
          <Link
            to="/login"
            className="text-foreground underline underline-offset-4"
          >
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm onSuccess={() => navigate({ to: '/' })} />
    </AuthLayout>
  )
}
