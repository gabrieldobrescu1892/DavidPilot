"use client";

import { FormEvent, useMemo, useState } from "react";
import { BookingButton } from "./SiteShell";

type Lang = "en" | "ro";

type Props = { lang: Lang };

const copy = {
  en: {
    eyebrow: "AI COPY STUDIO",
    title: "Business content, engineered for conversion.",
    intro: "Generate one professional piece of copy in English or Romanian. Choose the format, describe your offer, and receive a polished first draft tailored to your audience.",
    benefits: ["LinkedIn posts", "Sales emails", "Landing pages", "Google ads", "Product copy", "Lead follow-ups", "Romanian & English", "Business-focused tone"],
    try: "Try one free generation",
    book: "Book a strategy session",
    type: "Content type",
    language: "Output language",
    topic: "Topic or brief",
    audience: "Target audience",
    name: "Name",
    company: "Company",
    email: "Business email",
    phone: "Phone",
    consent: "By generating, you agree that DavidPilot may contact you about relevant AI services.",
    generate: "Generate my copy",
    generating: "Generating…",
    result: "Your generated copy",
    copyButton: "Copy text",
    copied: "Copied",
    another: "Start over",
    error: "We could not generate the copy. Please check the details and try again.",
    topicPlaceholder: "Example: A LinkedIn post promoting an AI receptionist for private clinics.",
    audiencePlaceholder: "Example: clinic owners and practice managers",
    previewTitle: "AI Copy Studio",
    previewMeta: "LinkedIn post · Healthcare · Professional",
    previewText: "Every missed call can become a missed patient. An AI receptionist helps clinics answer questions, qualify requests and book appointments around the clock—without adding more administrative pressure to the team.",
  },
  ro: {
    eyebrow: "AI COPY STUDIO",
    title: "Conținut de business proiectat pentru conversie.",
    intro: "Generează gratuit un material profesional în română sau engleză. Alege formatul, descrie oferta și primește un prim draft adaptat publicului tău.",
    benefits: ["Postări LinkedIn", "Emailuri de vânzări", "Landing pages", "Reclame Google", "Descrieri de produs", "Follow-up pentru lead-uri", "Română și engleză", "Ton orientat spre business"],
    try: "Încearcă o generare gratuită",
    book: "Programează o sesiune strategică",
    type: "Tip de conținut",
    language: "Limba rezultatului",
    topic: "Subiect sau brief",
    audience: "Public țintă",
    name: "Nume",
    company: "Companie",
    email: "Email de business",
    phone: "Telefon",
    consent: "Prin generare, ești de acord ca DavidPilot să te contacteze în legătură cu servicii AI relevante.",
    generate: "Generează textul",
    generating: "Se generează…",
    result: "Textul generat",
    copyButton: "Copiază textul",
    copied: "Copiat",
    another: "Începe din nou",
    error: "Nu am putut genera textul. Verifică datele și încearcă din nou.",
    topicPlaceholder: "Exemplu: O postare LinkedIn despre un recepționer AI pentru clinici private.",
    audiencePlaceholder: "Exemplu: proprietari și manageri de clinici",
    previewTitle: "AI Copy Studio",
    previewMeta: "Postare LinkedIn · Healthcare · Profesional",
    previewText: "Fiecare apel pierdut poate însemna un pacient pierdut. Un recepționer AI ajută clinicile să răspundă la întrebări, să califice solicitările și să programeze consultații 24/7, fără presiune administrativă suplimentară.",
  },
};

const contentTypes = {
  en: ["LinkedIn post", "Sales email", "Landing page copy", "Google ad", "Product description", "Lead follow-up email"],
  ro: ["Postare LinkedIn", "Email de vânzări", "Text pentru landing page", "Reclamă Google", "Descriere de produs", "Email de follow-up"],
};

export default function PublicCopyStudio({ lang }: Props) {
  const c = copy[lang];
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    contentType: contentTypes[lang][0],
    outputLanguage: lang,
    topic: "",
    audience: "",
    name: "",
    company: "",
    email: "",
    phone: "",
  });

  const valid = useMemo(() =>
    form.topic.trim().length >= 12 &&
    form.audience.trim().length >= 3 &&
    form.name.trim().length >= 2 &&
    form.company.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim().length >= 6,
  [form]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setError("");

    try {
      const leadResponse = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          language: lang,
          lead: {
            business: form.company,
            weeklyInquiries: null,
            mainProblem: `Interested in AI Copy Studio. Requested ${form.contentType}. Brief: ${form.topic}`,
            score: 60,
            estimatedTimeSaved: null,
            qualified: true,
          },
          conversation: [
            { sender: "user", text: `AI Copy Studio request: ${form.contentType}. Audience: ${form.audience}. Brief: ${form.topic}` },
          ],
        }),
      });

      if (!leadResponse.ok) throw new Error("lead");

      const response = await fetch("/api/copy-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: form.contentType,
          language: form.outputLanguage,
          audience: form.audience,
          topic: form.topic,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.output) throw new Error("generation");
      setOutput(data.output);
      try { sessionStorage.setItem("davidpilot-copy-trial-used", "1"); } catch {}
    } catch {
      setError(c.error);
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function reset() {
    setOutput("");
    setError("");
    setOpen(false);
  }

  return (
    <section className="public-copy-section" id="copy-studio">
      <div className="container public-copy-grid">
        <div className="public-copy-content">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
          <div className="public-copy-benefits">{c.benefits.map((item) => <span key={item}><i>✓</i>{item}</span>)}</div>
          <div className="public-copy-actions">
            <button className="button" type="button" onClick={() => setOpen(true)}>{c.try}</button>
            <BookingButton className="button button-ghost">{c.book}</BookingButton>
          </div>
        </div>
        <div className="public-copy-preview" aria-label={c.previewTitle}>
          <div className="copy-preview-bar"><span/><span/><span/><small>DAVIDPILOT</small></div>
          <div className="copy-preview-toolbar"><strong>{c.previewTitle}</strong><span>{c.previewMeta}</span></div>
          <article><span className="copy-cursor"/>{c.previewText}</article>
          <div className="copy-preview-footer"><span>AI</span><small>Generated with DavidPilot</small></div>
        </div>
      </div>

      {open && <div className="copy-trial-overlay" role="dialog" aria-modal="true" aria-label={c.try} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className="copy-trial-modal">
          <button className="copy-trial-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button>
          {!output ? <>
            <div className="copy-trial-heading"><span>{c.eyebrow}</span><h3>{c.try}</h3><p>{c.intro}</p></div>
            <form onSubmit={submit} className="copy-trial-form">
              <label><span>{c.type}</span><select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })}>{contentTypes[lang].map((type) => <option key={type}>{type}</option>)}</select></label>
              <label><span>{c.language}</span><select value={form.outputLanguage} onChange={(e) => setForm({ ...form, outputLanguage: e.target.value as Lang })}><option value="en">English</option><option value="ro">Română</option></select></label>
              <label className="full"><span>{c.topic}</span><textarea rows={4} placeholder={c.topicPlaceholder} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}/></label>
              <label className="full"><span>{c.audience}</span><input placeholder={c.audiencePlaceholder} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}/></label>
              <label><span>{c.name}</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label>
              <label><span>{c.company}</span><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}/></label>
              <label><span>{c.email}</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label>
              <label><span>{c.phone}</span><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/></label>
              <p className="copy-trial-consent full">{c.consent}</p>
              {error && <p className="copy-trial-error full">{error}</p>}
              <button className="button full" disabled={!valid || loading}>{loading ? c.generating : c.generate}</button>
            </form>
          </> : <div className="copy-trial-result">
            <span className="eyebrow">{c.result}</span>
            <article>{output}</article>
            <div><button className="button" onClick={copyOutput}>{copied ? c.copied : c.copyButton}</button><BookingButton className="button button-ghost">{c.book}</BookingButton><button className="text-link" onClick={reset}>{c.another}</button></div>
          </div>}
        </div>
      </div>}
    </section>
  );
}
