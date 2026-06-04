import LoginForm from "./LoginForm";
import { AuthPageShell } from "../_components/AuthPageShell";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectParam } = await searchParams;
  const redirectUrl = redirectParam || "/me";

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="登录 Pebble AI"
      subtitle="回到你的情绪防御工作台，继续管理关系档案与练习记录。"
    >
      <LoginForm redirectUrl={redirectUrl} />
    </AuthPageShell>
  );
}
