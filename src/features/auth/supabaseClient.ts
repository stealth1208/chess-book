export type AuthUser = {
  id: string;
};

const AUTH_STORAGE_KEY = 'xiangqi.auth.user';

type AuthListener = (user: AuthUser | null) => void;
const listeners = new Set<AuthListener>();

export function getCurrentAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function subscribeAuthStateChange(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(user: AuthUser | null): void {
  for (const listener of listeners) {
    listener(user);
  }
}

export function setMockAuthUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  emit(user);
}

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };
}
