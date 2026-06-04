export type AuthFormState = {
  error: string | null;
  message: string | null;
};

export const INITIAL_STATE: AuthFormState = {
  error: null,
  message: null,
};
