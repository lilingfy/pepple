import { AuthPageShell } from "../_components/AuthPageShell";
import RegisterForm from "./RegisterForm";

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect: redirectParam } = await searchParams;
  const redirectUrl = redirectParam || "/me";

  return (
    <AuthPageShell
      eyebrow="Create account"
      title="注册 Pebble AI"
      subtitle="创建账号后，把临时体验沉淀为可持续的关系档案与练习记录。"
    >
      <RegisterForm redirectUrl={redirectUrl} />
    </AuthPageShell>
  );
}
