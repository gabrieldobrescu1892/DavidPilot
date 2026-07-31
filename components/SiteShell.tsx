"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Lang = "en" | "ro";
type Message = { sender: "user" | "ai"; text: string };
type LeadData = {
  business: string | null;
  weeklyInquiries: string | null;
  score: number | null;
  estimatedTimeSaved: string | null;
  qualified: boolean;
};

const emptyLead: LeadData = {
  business: null,
  weeklyInquiries: null,
  score: null,
  estimatedTimeSaved: null,
  qualified: false,
};

const copy = {
  en: {
    nav: [
      ["Solutions", "/solutions"],
      ["Investment", "/#investment"],
      ["ROI", "/#roi"],
      ["How we work", "/#process"],
      ["About", "/about"],
      ["Resources", "/resources"],
      ["Contact", "/contact"],
    ],
    cta: "Book a consultation",
    chatTitle: "DavidPilot AI Consultant",
    chatIntro: "Hello. I can help you identify where AI can create measurable value in your business.",
    chatPlaceholder: "Describe your business challenge…",
    chatError: "The consultant is temporarily unavailable. Please email gabriel@davidpilot.com.",
    chatLauncher: "AI Chat",
    chatBadge: "Ask our AI consultant",
    reset: "Reset",
    contact: "Book consultation",
  },
  ro: {
    nav: [
      ["Soluții", "/solutions"],
      ["Investiție", "/#investment"],
      ["ROI", "/#roi"],
      ["Cum lucrăm", "/#process"],
      ["Despre", "/about"],
      ["Resurse", "/resources"],
      ["Contact", "/contact"],
    ],
    cta: "Programează o consultație",
    chatTitle: "Consultantul AI DavidPilot",
    chatIntro: "Salut. Te pot ajuta să identifici unde poate AI-ul să creeze valoare măsurabilă în compania ta.",
    chatPlaceholder: "Descrie provocarea companiei tale…",
    chatError: "Consultantul este temporar indisponibil. Scrie-ne la gabriel@davidpilot.com.",
    chatLauncher: "Chat AI",
    chatBadge: "Discută cu consultantul AI",
    reset: "Resetează",
    contact: "Programează consultația",
  },
};

export function useLanguage() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem("davidpilot-language") as Lang | null;
    if (saved === "ro" || saved === "en") setLang(saved);
  }, []);
  const change = (next: Lang) => {
    setLang(next);
    window.localStorage.setItem("davidpilot-language", next);
    document.documentElement.lang = next;
  };
  return { lang, setLang: change };
}

export function SiteHeader({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="DavidPilot home">
        <span>DAVIDPILOT</span>
        <small>Enterprise AI Engineering</small>
      </Link>
      <nav className="desktop-nav">
        {copy[lang].nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <div className="language-switch" aria-label="Language selector">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "ro" ? "active" : ""} onClick={() => setLang("ro")}>RO</button>
        </div>
        <Link href="/contact" className="button button-small">{copy[lang].cta}</Link>
      </div>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="site-footer">
      <div>
        <div className="footer-brand">DAVIDPILOT</div>
        <p>Enterprise AI Engineering</p>
      </div>
      <div className="footer-links">
        <a href="mailto:gabriel@davidpilot.com">gabriel@davidpilot.com</a>
        <a href="tel:+40740985987">+40 740 985 987</a>
        <a href="https://wa.me/40740985987" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
      <p className="copyright">© {new Date().getFullYear()} DavidPilot. {lang === "ro" ? "Toate drepturile rezervate." : "All rights reserved."}</p>
    </footer>
  );
}

export function ChatConsultant({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ sender: "ai", text: copy[lang].chatIntro }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<LeadData>(emptyLead);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = window.localStorage.getItem("davidpilot-chat-messages");
    const savedLead = window.localStorage.getItem("davidpilot-chat-lead");
    if (savedMessages) {
      try { setMessages(JSON.parse(savedMessages) as Message[]); } catch { /* ignore invalid local data */ }
    }
    if (savedLead) {
      try { setLead(JSON.parse(savedLead) as LeadData); } catch { /* ignore invalid local data */ }
    }
  }, []);
  useEffect(() => {
    setMessages((current) => current.length === 1 ? [{ sender: "ai", text: copy[lang].chatIntro }] : current);
  }, [lang]);
  useEffect(() => {
    window.localStorage.setItem("davidpilot-chat-messages", JSON.stringify(messages));
    window.localStorage.setItem("davidpilot-chat-lead", JSON.stringify(lead));
  }, [messages, lead]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  useEffect(() => {
    const alreadyShown = window.sessionStorage.getItem("davidpilot-chat-popup-shown");
    if (alreadyShown) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem("davidpilot-chat-popup-shown", "true");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { sender: "user" as const, text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language: lang, lead }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/json")) throw new Error("Invalid API response");
      const data = await response.json();
      if (data.lead) setLead(data.lead as LeadData);
      setMessages((current) => [...current, { sender: "ai", text: data.message || data.reply || copy[lang].chatError }]);
    } catch {
      setMessages((current) => [...current, { sender: "ai", text: copy[lang].chatError }]);
    } finally { setLoading(false); }
  }

  function resetConversation() {
    setMessages([{ sender: "ai", text: copy[lang].chatIntro }]);
    setLead(emptyLead);
    setInput("");
  }

  return (
    <>
      {open && <button className="chat-backdrop" aria-label="Close AI consultant" onClick={() => setOpen(false)} />}
      {open && <section className="chat-panel chat-panel-visible" aria-label={copy[lang].chatTitle}>
        <div className="chat-head">
          <div className="chat-identity">
            <div className="chat-avatar">DP</div>
            <div>
              <strong>{copy[lang].chatTitle}</strong>
              <span><i className="status-dot" />{lang === "ro" ? "Online · răspunde în câteva secunde" : "Online · replies in seconds"}</span>
            </div>
          </div>
          <div className="chat-head-actions">
            <button className="chat-reset" onClick={resetConversation}>{copy[lang].reset}</button>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => <div key={i} className={`chat-message ${m.sender}`}>{m.text}</div>)}
          {loading && <div className="chat-message ai typing"><i /><i /><i /></div>}
          <div ref={endRef} />
        </div>
        {lead.qualified && <Link className="chat-contact-link" href="/contact" onClick={() => setOpen(false)}>{copy[lang].contact} →</Link>}
        <div className="chat-input-row">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={copy[lang].chatPlaceholder} rows={1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button onClick={send} disabled={loading || !input.trim()} aria-label="Send">↑</button>
        </div>
      </section>}
      {!open && <div className="chat-launcher-wrap">
        <div className="chat-teaser">
          <span className="status-dot" />
          {copy[lang].chatBadge}
        </div>
        <button className="chat-launcher" onClick={() => setOpen(true)} aria-label="Open AI consultant"><span>AI</span><strong>{copy[lang].chatLauncher}</strong></button>
      </div>}
    </>
  );
}

export function PageFrame({ children }: { children: (props: { lang: Lang }) => React.ReactNode }) {
  const { lang, setLang } = useLanguage();
  return <><SiteHeader lang={lang} setLang={setLang} /><main>{children({ lang })}</main><SiteFooter lang={lang} /><ChatConsultant lang={lang} /></>;
}
