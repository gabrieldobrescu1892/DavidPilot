"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./admin.css";

type LeadStatus = "new" | "contacted" | "demo_booked" | "customer" | "closed";
type Level = "low" | "medium" | "high";
type Maturity = "early" | "developing" | "advanced";

type Lead = {
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
  urgency: Level | null;
  buying_intent: Level | null;
  ai_maturity: Maturity | null;
  estimated_value_min: number | null;
  estimated_value_max: number | null;
  recommended_service: string | null;
  ai_summary: string | null;
  next_action: string | null;
  last_activity: string | null;
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  demo_booked: "Meeting booked",
  customer: "Customer",
  closed: "Closed",
};

function money(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  const formatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  if (min != null && max != null && min !== max) {
    return `${formatter.format(min)}–${formatter.format(max)}`;
  }
  return formatter.format(min ?? max ?? 0);
}

function scoreClass(score: number | null) {
  if ((score ?? 0) >= 80) return "hot";
  if ((score ?? 0) >= 55) return "warm";
  return "cool";
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status });
    const response = await fetch(`/api/admin/leads?${params}`, { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    const data = await response.json();
    setLeads(data.leads || []);
    setAuthenticated(true);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const visibleLeads = useMemo(() => {
    const filtered = priority === "hot"
      ? leads.filter((lead) => (lead.lead_score ?? 0) >= 80)
      : priority === "qualified"
        ? leads.filter((lead) => lead.qualified)
        : leads;
    return [...filtered].sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
  }, [leads, priority]);

  const metrics = useMemo(() => {
    const values = leads.map((lead) => lead.estimated_value_max ?? lead.estimated_value_min ?? 0);
    return {
      total: leads.length,
      hot: leads.filter((lead) => (lead.lead_score ?? 0) >= 80).length,
      booked: leads.filter((lead) => lead.status === "demo_booked").length,
      pipeline: values.reduce((sum, value) => sum + value, 0),
    };
  }, [leads]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setMessage("Incorrect password.");
      return;
    }
    setPassword("");
    await load();
  }

  async function update(id: string, patch: Partial<Lead>) {
    const response = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (response.ok) {
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...patch } : lead));
      setSelected((current) => current?.id === id ? { ...current, ...patch } : current);
    }
  }

  if (authenticated === false) {
    return (
      <main className="admin-login">
        <form onSubmit={login}>
          <div className="admin-mark">DP</div>
          <span className="eyebrow">DAVIDPILOT</span>
          <h1>Lead Cockpit</h1>
          <p>Sign in to review AI-qualified opportunities.</p>
          <input type="password" placeholder="Admin password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
          {message && <div className="admin-error">{message}</div>}
          <button>Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header>
        <div>
          <span className="eyebrow">DAVIDPILOT · SALES INTELLIGENCE</span>
          <h1>Lead Cockpit</h1>
          <p>Prioritize opportunities with AI-generated context and next actions.</p>
        </div>
        <button className="logout" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthenticated(false); }}>Sign out</button>
      </header>

      <section className="metrics">
        <article><span>Total leads</span><strong>{metrics.total}</strong><small>All captured opportunities</small></article>
        <article><span>Hot leads</span><strong>{metrics.hot}</strong><small>Score of 80 or higher</small></article>
        <article><span>Meetings booked</span><strong>{metrics.booked}</strong><small>Active strategy sessions</small></article>
        <article><span>Pipeline potential</span><strong>{money(metrics.pipeline, null)}</strong><small>Indicative upper range</small></article>
      </section>

      <section className="toolbar">
        <input placeholder="Search company, contact, industry or solution…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="all">All priorities</option>
          <option value="hot">Hot leads</option>
          <option value="qualified">Qualified</option>
        </select>
      </section>

      <section className="lead-grid">
        {loading ? <div className="empty">Loading opportunities…</div> : visibleLeads.length === 0 ? <div className="empty">No leads found.</div> : visibleLeads.map((lead) => (
          <button className="lead-card" key={lead.id} onClick={() => setSelected(lead)}>
            <div className="lead-card-top">
              <div className={`score-orb ${scoreClass(lead.lead_score)}`}><strong>{lead.lead_score ?? "—"}</strong><small>/100</small></div>
              <div className="lead-badges">
                {lead.lead_score != null && lead.lead_score >= 80 && <i className="priority hot">Hot lead</i>}
                <i className={`status ${lead.status}`}>{statusLabels[lead.status]}</i>
              </div>
            </div>
            <h2>{lead.company}</h2>
            <p className="contact-name">{lead.name} · {lead.industry || lead.business_type || "Industry unknown"}</p>
            <div className="card-detail"><span>Recommended solution</span><strong>{lead.recommended_service || "Review conversation"}</strong></div>
            <div className="card-detail"><span>Opportunity range</span><strong>{money(lead.estimated_value_min, lead.estimated_value_max)}</strong></div>
            <div className="card-footer"><span>{lead.urgency ? `${lead.urgency} urgency` : "Urgency unknown"}</span><span>{new Date(lead.created_at).toLocaleDateString()}</span></div>
          </button>
        ))}
      </section>

      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <span className="eyebrow">LEAD INTELLIGENCE</span>
            <div className="drawer-heading">
              <div><h2>{selected.company}</h2><p>{selected.name}</p></div>
              <div className={`score-orb large ${scoreClass(selected.lead_score)}`}><strong>{selected.lead_score ?? "—"}</strong><small>/100</small></div>
            </div>

            <div className="contact-grid"><a href={`mailto:${selected.email}`}>{selected.email}</a><a href={`tel:${selected.phone}`}>{selected.phone}</a></div>

            <label className="field"><span>Pipeline status</span><select value={selected.status} onChange={(event) => update(selected.id, { status: event.target.value as LeadStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>

            <section className="intelligence-panel">
              <div><span>Industry</span><strong>{selected.industry || selected.business_type || "—"}</strong></div>
              <div><span>Company size</span><strong>{selected.company_size || "—"}</strong></div>
              <div><span>Buying intent</span><strong>{selected.buying_intent || "—"}</strong></div>
              <div><span>AI maturity</span><strong>{selected.ai_maturity || "—"}</strong></div>
              <div><span>Urgency</span><strong>{selected.urgency || "—"}</strong></div>
              <div><span>Value range</span><strong>{money(selected.estimated_value_min, selected.estimated_value_max)}</strong></div>
            </section>

            <section className="analysis-block"><h3>AI summary</h3><p>{selected.ai_summary || selected.main_problem || "No AI summary is available for this lead."}</p></section>
            <section className="analysis-block accent"><h3>Recommended service</h3><p>{selected.recommended_service || "Review the conversation and select the most relevant service."}</p></section>
            <section className="analysis-block next"><h3>Next recommended action</h3><p>{selected.next_action || "Contact the lead and clarify business priorities."}</p></section>

            <section><h3>Conversation</h3><div className="transcript">{(selected.conversation || []).map((message, index) => <p key={index} className={message.sender}><small>{message.sender === "user" ? "Visitor" : "DavidPilot"}</small>{message.text}</p>)}</div></section>

            <label className="field"><span>Internal notes</span><textarea rows={5} value={selected.notes || ""} onChange={(event) => setSelected({ ...selected, notes: event.target.value })} onBlur={() => update(selected.id, { notes: selected.notes })} placeholder="Add follow-up notes…" /></label>
          </aside>
        </div>
      )}
    </main>
  );
}
