import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { AuthLayout } from '@/app/auth-layout'
import { authApi, LoginForm } from '@/features/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (authApi.isAuthenticated()) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      description="Entre para ver como estão suas metas."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link
            to="/register"
            className="text-foreground underline underline-offset-4"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm onSuccess={() => navigate({ to: '/' })} />
    </AuthLayout>
  )
}
