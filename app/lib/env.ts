function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export const env = {
  supabase: {
    get url() {
      return required("NEXT_PUBLIC_SUPABASE_URL");
    },
    get anonKey() {
      return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    },
    get serviceRoleKey() {
      return required("SUPABASE_SERVICE_ROLE_KEY");
    },
  },
  admin: {
    get password() {
      return required("COLLAGIUM_ADMIN_PASSWORD");
    },
  },
  storage: {
    get bucket() {
      return process.env.COLLAGIUM_STORAGE_BUCKET || "collagium-images";
    },
  },
} as const;

