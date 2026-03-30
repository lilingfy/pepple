function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Please check your .env.local file and ensure ${name} is set.`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
