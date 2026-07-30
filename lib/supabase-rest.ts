export type LeadStatus = "new" | "contacted" | "demo_booked" | "customer" | "closed";

function config() {
  const url = process.env.SUPABASE_URL
    ?.trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured.");
  }

  return { url, key };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }
  return response;
}

export async function insertLead(lead:any){
  await supabaseFetch("leads",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(lead)});
}
