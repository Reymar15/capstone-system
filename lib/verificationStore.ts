import { supabase } from "./supabase";

export async function saveCode(email: string, code: string) {
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabase.from("verification_codes").upsert({
    email: email.toLowerCase(),
    code,
    expires_at: expires,
  });
}

export async function getCode(email: string): Promise<{ code: string; expires: number } | null> {
  const { data } = await supabase
    .from("verification_codes")
    .select("code, expires_at")
    .eq("email", email.toLowerCase())
    .single();

  if (!data) return null;
  return { code: data.code, expires: new Date(data.expires_at).getTime() };
}

export async function deleteCode(email: string) {
  await supabase.from("verification_codes").delete().eq("email", email.toLowerCase());
}
