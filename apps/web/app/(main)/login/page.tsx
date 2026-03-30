import LoginForm from "./LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectParam } = await searchParams;
  const redirectUrl = redirectParam || "/me";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            登录 Pebble AI
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            使用邮箱和密码登录您的账户
          </p>
        </div>

        <LoginForm redirectUrl={redirectUrl} />
      </div>
    </div>
  );
}
