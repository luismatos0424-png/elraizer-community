import { supabaseAdmin } from "../supabase/server";
export async function checkAntiClone({ fingerprint, ip, phone, email }: { fingerprint: string; ip: string; phone?: string; email?: string }){
 const supabase = supabaseAdmin();
 const { data: fpExists } = await supabase.from("user_fingerprints").select("id").eq("fingerprint", fingerprint).gte("created_at", new Date(Date.now()-7*24*60*60*1000).toISOString());
 if(fpExists && fpExists.length>0) throw new Error("Cuenta clon detectada por fingerprint");
 const { data: ipCount } = await supabase.from("ip_logs").select("id").eq("ip", ip).gte("created_at", new Date(Date.now()-24*60*60*1000).toISOString());
 if(ipCount && ipCount.length>=2) throw new Error("Limite IP alcanzado");
 return true;
}
