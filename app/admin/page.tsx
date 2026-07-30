"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import "./admin.css";

type LeadStatus = "new" | "contacted" | "demo_booked" | "customer" | "closed";

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
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  demo_booked: "Demo booked",
  customer: "Customer",
  closed: "Closed",
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status });
    const response = await fetch(`/api/admin/leads?${params}`, {
      cache: "no-store",
    });

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

  const metrics = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      booked: leads.filter((lead) => lead.status === "demo_booked").length,
      customers: leads.filter((lead) => lead.status === "customer").length,
    }),
    [leads]
  );

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
      setLeads((current) =>
        current.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead))
      );
      setSelected((current) =>
        current?.id === id ? { ...current, ...patch } : current
      );
    }
  }

  if (authenticated === false) {
    return (
      <main className="admin-login">
        <form onSubmit={login}>
          <div className="admin-mark">DP</div>
          <h1>DavidPilot Admin</h1>
          <p>Sign in to view and manage incoming leads.</p>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
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
          <span className="eyebrow">DAVIDPILOT</span>
          <h1>Lead cockpit</h1>
        </div>
        <button
          className="logout"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setAuthenticated(false);
          }}
        >
          Sign out
        </button>
      </header>

      <section className="metrics">
        <article><span>Total leads</span><strong>{metrics.total}</strong></article>
        <article><span>New</span><strong>{metrics.new}</strong></article>
        <article><span>Demos booked</span><strong>{metrics.booked}</strong></article>
        <article><span>Customers</span><strong>{metrics.customers}</strong></article>
      </section>

      <section className="toolbar">
        <input
          placeholder="Search name, company, email or phone…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </section>

      <section className="lead-table">
        <div className="table-head">
          <span>Lead</span><span>Business</span><span>Score</span><span>Status</span><span>Date</span>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="empty">No leads found.</div>
        ) : (
          leads.map((lead) => (
            <button className="lead-row" key={lead.id} onClick={() => setSelected(lead)}>
              <span><strong>{lead.name}</strong><small>{lead.company}<br />{lead.email}</small></span>
              <span>{lead.business_type || "—"}<small>{lead.weekly_inquiries || "Unknown volume"}</small></span>
              <span className="score">{lead.lead_score ?? "—"}</span>
              <span><i className={`status ${lead.status}`}>{statusLabels[lead.status]}</i></span>
              <span>{new Date(lead.created_at).toLocaleDateString()}</span>
            </button>
          ))
        )}
      </section>

      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <span className="eyebrow">LEAD DETAILS</span>
            <h2>{selected.name}</h2>
            <p className="company">{selected.company}</p>

            <div className="contact-grid">
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
              <a href={`tel:${selected.phone}`}>{selected.phone}</a>
            </div>

            <label className="field">
              <span>Status</span>
              <select
                value={selected.status}
                onChange={(event) =>
                  update(selected.id, { status: event.target.value as LeadStatus })
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <div className="facts">
              <p><span>Business</span><strong>{selected.business_type || "—"}</strong></p>
              <p><span>Weekly inquiries</span><strong>{selected.weekly_inquiries || "—"}</strong></p>
              <p><span>Lead score</span><strong>{selected.lead_score ?? "—"}</strong></p>
              <p><span>Time saved</span><strong>{selected.estimated_time_saved || "—"}</strong></p>
            </div>

            {selected.main_problem && (
              <section>
                <h3>Main problem</h3>
                <p>{selected.main_problem}</p>
              </section>
            )}

            <section>
              <h3>Conversation</h3>
              <div className="transcript">
                {(selected.conversation || []).map((message, index) => (
                  <p key={index} className={message.sender}>
                    <small>{message.sender === "user" ? "Visitor" : "DavidPilot"}</small>
                    {message.text}
                  </p>
                ))}
              </div>
            </section>

            <label className="field">
              <span>Internal notes</span>
              <textarea
                rows={5}
                value={selected.notes || ""}
                onChange={(event) =>
                  setSelected({ ...selected, notes: event.target.value })
                }
                onBlur={() => update(selected.id, { notes: selected.notes })}
                placeholder="Add follow-up notes…"
              />
            </label>
          </aside>
        </div>
      )}
    </main>
  );
}
