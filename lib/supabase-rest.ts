export type LeadStatus =
  | "new"
  | "contacted"
  | "demo_booked"
  | "customer"
  | "closed";

export type StoredLead = {
  id: string;
  created_at: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  language: "ro" | "en";
  business_type: string | null;
  weekly_inquiries: string | null;
  main_problem: string | null;
  lead_score: number | null;
  estimated_time_saved: string | null;
  qualified: boolean;
  conversation: Array<{ sender: "ai" | "user"; text: string }>;
  status: LeadStatus;
  notes: string | null;
};

function config() {
  const url = process.env.SUPABASE_URL
    ?.trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  const key =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured."
    );
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

export async function insertLead(
  lead: Omit<StoredLead, "id" | "created_at">
) {
  await supabaseFetch("leads", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(lead),
  });
}

export async function listLeads(options?: {
  search?: string;
  status?: string;
}) {
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
    limit: "200",
  });

  if (options?.status && options.status !== "all") {
    params.set("status", `eq.${options.status}`);
  }

  if (options?.search) {
    const safe = options.search.replace(/[(),]/g, " ").trim();

    if (safe) {
      params.set(
        "or",
        `(name.ilike.*${safe}*,company.ilike.*${safe}*,email.ilike.*${safe}*,phone.ilike.*${safe}*)`
      );
    }
  }

  const response = await supabaseFetch(`leads?${params.toString()}`);
  return (await response.json()) as StoredLead[];
}

export async function updateLead(
  id: string,
  patch: Partial<Pick<StoredLead, "status" | "notes">>
) {
  await supabaseFetch(`leads?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
}
