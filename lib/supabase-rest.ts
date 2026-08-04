export type LeadStatus =
  | "new"
  | "contacted"
  | "demo_booked"
  | "proposal_sent"
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
  industry: string | null;
  company_size: string | null;
  urgency: "low" | "medium" | "high" | null;
  buying_intent: "low" | "medium" | "high" | null;
  ai_maturity: "early" | "developing" | "advanced" | null;
  estimated_value_min: number | null;
  estimated_value_max: number | null;
  recommended_service: string | null;
  ai_summary: string | null;
  next_action: string | null;
  last_activity: string | null;
  meeting_status: "not_booked" | "booked" | "completed" | "cancelled" | "no_show" | null;
  meeting_at: string | null;
  next_follow_up: string | null;
  owner: string | null;
  lost_reason: string | null;
  activity: Array<{ at: string; type: string; label: string }> | null;
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
        `(name.ilike.*${safe}*,company.ilike.*${safe}*,email.ilike.*${safe}*,phone.ilike.*${safe}*,industry.ilike.*${safe}*,recommended_service.ilike.*${safe}*)`
      );
    }
  }

  const response = await supabaseFetch(`leads?${params.toString()}`);
  return (await response.json()) as StoredLead[];
}

export async function updateLead(
  id: string,
  patch: Partial<Pick<StoredLead, "status" | "notes" | "meeting_status" | "meeting_at" | "next_follow_up" | "owner" | "lost_reason" | "activity" | "last_activity">>
) {
  await supabaseFetch(`leads?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
}


export type CopyDraft = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content_type: string;
  language: "en" | "ro";
  tone: string | null;
  audience: string | null;
  goal: string | null;
  topic: string | null;
  call_to_action: string | null;
  output: string;
  lead_id: string | null;
  status: string;
};

export async function insertCopyDraft(
  draft: Omit<CopyDraft, "id" | "created_at" | "updated_at">
) {
  const response = await supabaseFetch("copy_drafts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(draft),
  });
  const rows = (await response.json()) as CopyDraft[];
  return rows[0] ?? null;
}

export async function listCopyDrafts() {
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
    limit: "50",
  });
  const response = await supabaseFetch(`copy_drafts?${params.toString()}`);
  return (await response.json()) as CopyDraft[];
}

export type ProposalContent = {
  executive_summary: string;
  current_challenges: string;
  recommended_solution: string;
  scope: string[];
  delivery_approach: string;
  expected_outcomes: string[];
  assumptions: string[];
  next_steps: string;
};

export type Proposal = {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  title: string;
  language: "en" | "ro";
  status: "draft" | "review" | "sent" | "accepted" | "declined";
  currency: string;
  investment_min: number | null;
  investment_max: number | null;
  timeline: string | null;
  valid_until: string | null;
  content: ProposalContent;
};

export async function listProposals() {
  const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: "100" });
  const response = await supabaseFetch(`proposals?${params.toString()}`);
  return (await response.json()) as Proposal[];
}

export async function insertProposal(proposal: Omit<Proposal, "id" | "created_at" | "updated_at">) {
  const response = await supabaseFetch("proposals", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(proposal),
  });
  const rows = (await response.json()) as Proposal[];
  return rows[0] ?? null;
}

export async function updateProposal(id: string, patch: Partial<Omit<Proposal, "id" | "created_at">>) {
  const response = await supabaseFetch(`proposals?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  const rows = (await response.json()) as Proposal[];
  return rows[0] ?? null;
}
