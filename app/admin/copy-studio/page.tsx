"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./copy-studio.css";

type Draft = {
  id: string;
  created_at: string;
  title: string;
  content_type: string;
  language: "en" | "ro";
  output: string;
};

const labels = {
  en: {
    title: "AI Copy Studio",
    subtitle: "Create credible, conversion-focused B2B content in minutes.",
    contentType: "Content type",
    language: "Language",
    audience: "Target audience",
    tone: "Tone",
    goal: "Goal",
    length: "Length",
    topic: "Topic or brief",
    cta: "Call to action",
    generate: "Generate copy",
    save: "Generate & save draft",
    result: "Generated copy",
    drafts: "Recent drafts",
    copy: "Copy",
    copied: "Copied",
    placeholder: "Describe the offer, message, product, or campaign...",
  },
  ro: {
    title: "AI Copy Studio",
    subtitle: "Creează conținut B2B credibil și orientat spre conversie în câteva minute.",
    contentType: "Tip de conținut",
    language: "Limba",
    audience: "Public țintă",
    tone: "Ton",
    goal: "Obiectiv",
    length: "Lungime",
    topic: "Subiect sau brief",
    cta: "Îndemn la acțiune",
    generate: "Generează textul",
    save: "Generează și salvează",
    result: "Text generat",
    drafts: "Drafturi recente",
    copy: "Copiază",
    copied: "Copiat",
    placeholder: "Descrie oferta, mesajul, produsul sau campania...",
  },
};

export default function CopyStudioPage() {
  const [uiLanguage, setUiLanguage] = useState<"en" | "ro">("en");
  const [form, setForm] = useState({
    contentType: "LinkedIn post",
    language: "en" as "en" | "ro",
    audience: "CEOs, founders and operations leaders",
    tone: "Professional, confident and technically credible",
    goal: "Generate qualified strategy-session bookings",
    length: "Medium",
    topic: "",
    callToAction: "Book a free AI strategy session",
  });
  const [output, setOutput] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const t = labels[uiLanguage];

  async function loadDrafts() {
    const response = await fetch("/api/admin/copy", { cache: "no-store" });
    if (response.status === 401) {
      setAuthorized(false);
      return;
    }
    const data = await response.json();
    setDrafts(data.drafts || []);
    setAuthorized(true);
  }

  useEffect(() => { loadDrafts(); }, []);

  const canGenerate = useMemo(() => form.topic.trim().length >= 5 && !loading, [form.topic, loading]);

  async function generate(save: boolean) {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setOutput("");
    const response = await fetch("/api/admin/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, save }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Generation failed.");
      if (response.status === 401) setAuthorized(false);
      setLoading(false);
      return;
    }
    setOutput(data.output || "");
    if (save) await loadDrafts();
    setLoading(false);
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (authorized === false) {
    return <main className="copy-auth"><div><span>DAVIDPILOT</span><h1>AI Copy Studio</h1><p>Your admin session is not active.</p><Link href="/admin">Sign in through Lead Cockpit</Link></div></main>;
  }

  return (
    <main className="copy-shell">
      <nav className="admin-nav">
        <Link href="/admin">Lead Cockpit</Link>
        <Link className="active" href="/admin/copy-studio">AI Copy Studio</Link>
        <div className="language-toggle"><button className={uiLanguage === "en" ? "active" : ""} onClick={() => setUiLanguage("en")}>EN</button><button className={uiLanguage === "ro" ? "active" : ""} onClick={() => setUiLanguage("ro")}>RO</button></div>
      </nav>

      <header className="copy-header">
        <div><span className="copy-eyebrow">DAVIDPILOT · CONTENT INTELLIGENCE</span><h1>{t.title}</h1><p>{t.subtitle}</p></div>
      </header>

      <div className="copy-layout">
        <section className="copy-form-card">
          <div className="form-grid">
            <label><span>{t.contentType}</span><select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })}><option>LinkedIn post</option><option>Sales email</option><option>Landing page copy</option><option>Lead follow-up email</option><option>Google ad</option><option>Case study outline</option><option>Blog article outline</option><option>Product description</option></select></label>
            <label><span>{t.language}</span><select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as "en" | "ro" })}><option value="en">English</option><option value="ro">Română</option></select></label>
            <label><span>{t.audience}</span><input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label>
            <label><span>{t.tone}</span><input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} /></label>
            <label><span>{t.goal}</span><input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></label>
            <label><span>{t.length}</span><select value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })}><option>Short</option><option>Medium</option><option>Long</option></select></label>
            <label className="full"><span>{t.topic}</span><textarea rows={7} placeholder={t.placeholder} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></label>
            <label className="full"><span>{t.cta}</span><input value={form.callToAction} onChange={(e) => setForm({ ...form, callToAction: e.target.value })} /></label>
          </div>
          {error && <p className="copy-error">{error}</p>}
          <div className="copy-actions"><button className="secondary" disabled={!canGenerate} onClick={() => generate(false)}>{loading ? "Generating…" : t.generate}</button><button disabled={!canGenerate} onClick={() => generate(true)}>{loading ? "Generating…" : t.save}</button></div>
        </section>

        <section className="copy-output-card">
          <div className="panel-heading"><div><span>{t.result}</span><strong>{form.contentType}</strong></div>{output && <button onClick={copyOutput}>{copied ? t.copied : t.copy}</button>}</div>
          <article className={output ? "copy-output populated" : "copy-output"}>{output || (uiLanguage === "ro" ? "Textul generat va apărea aici." : "Your generated copy will appear here.")}</article>
        </section>
      </div>

      <section className="draft-section"><div className="section-heading"><h2>{t.drafts}</h2><span>{drafts.length}</span></div><div className="draft-grid">{drafts.length === 0 ? <p className="no-drafts">No saved drafts yet.</p> : drafts.map((draft) => <button key={draft.id} onClick={() => { setOutput(draft.output); setForm((current) => ({ ...current, contentType: draft.content_type, language: draft.language })); window.scrollTo({ top: 0, behavior: "smooth" }); }}><small>{draft.content_type} · {draft.language.toUpperCase()}</small><strong>{draft.title}</strong><p>{draft.output.slice(0, 180)}{draft.output.length > 180 ? "…" : ""}</p><time>{new Date(draft.created_at).toLocaleDateString()}</time></button>)}</div></section>
    </main>
  );
}
