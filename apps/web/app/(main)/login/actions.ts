"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/utils/redirect-sanitizer";

export type AuthFormState = {
  error: string | null;
  message: string | null;
};

export const INITIAL_STATE: AuthFormState = {
  error: null,
  message: null,
};

export async function signInAction(
  _prev: AuthFormState | null,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawRedirectTo = formData.get("redirectTo") as string | null;

  if (!email || !password) {
    return { error: "邮箱和密码不能为空", message: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: error?.message || "登录失败，请检查邮箱和密码", message: null };
  }

  revalidatePath("/", "layout");
  redirect(getSafeRedirect(rawRedirectTo, "/me"));
}

export async function signUpAction(
  _prev: AuthFormState | null,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawRedirectTo = formData.get("redirectTo") as string | null;

  if (!email || !password) {
    return { error: "邮箱和密码不能为空", message: null };
  }

  if (password.length < 8) {
    return { error: "密码至少需要8个字符", message: null };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  // If no session, email confirmation is required
  if (!data.session) {
    return {
      error: null,
      message: "注册成功，请先完成邮箱验证后再登录。",
    };
  }

  // Auto-signed in, redirect
  revalidatePath("/", "layout");
  redirect(getSafeRedirect(rawRedirectTo, "/me"));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
