"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type Message = {
  sender: "ai" | "user";
  text: string;
};

type LeadData = {
  business: string | null;
  weeklyInquiries: string | null;
  score: number | null;
  estimatedTimeSaved: string | null;
  qualified: boolean;
};

type ChatResponse = {
  message: string;
  lead: LeadData;
};

type Language = "ro" | "en";

const translations = {
  ro: {
    navigation: {
      product: "Produs",
      industries: "Industrii",
      pricing: "Prețuri",
      demo: "Programează un demo",
    },
    hero: {
      eyebrow: "Angajat AI pentru afacerea ta",
      titleStart: "Angajează primul tău",
      titleHighlight: "angajat AI.",
      description:
        "DavidPilot răspunde instant clienților, califică lead-uri și programează întâlniri 24/7, astfel încât tu și echipa ta să vă concentrați pe dezvoltarea afacerii.",
      problemStrong: "Nu mai pierde clienți",
      problemRest: "atunci când nu poți răspunde la telefon.",
      primaryButton: "Programează un demo gratuit",
      secondaryButton: "Vezi demonstrația",
      proof: [
        "Răspunde în mai puțin de 10 secunde",
        "Integrare Google Calendar",
        "AI antrenat pentru afacerea ta",
        "Română & English",
      ],
      liveDemo: "LIVE DEMO",
    },
    demo: {
      available: "Disponibil acum",
      greeting:
        "Salut! 👋 Bine ai venit la DavidPilot. Cum îți pot ajuta afacerea astăzi?",
      placeholder: "Scrie mesajul tău…",
      suggestions: [
        "Vreau să automatizez solicitările clienților",
        "Am nevoie de mai multe lead-uri calificate",
        "Vreau programări automate",
      ],
      replies: [
        "Perfect. Ce tip de afacere ai?",
        "Aproximativ câte solicitări primești în fiecare săptămână?",
        "Excelent. DavidPilot poate răspunde solicitărilor, poate califica fiecare lead și poate programa automat întâlniri. Demo-ul tău gratuit este pregătit.",
      ],
      liveWorkflow: "FLUX LIVE",
      qualifiedLead: "Lead calificat",
      business: "Afacere",
      serviceCompany: "Companie de servicii",
      weeklyInquiries: "Solicitări săptămânale",
      leadScore: "Scor lead",
      estimatedTime: "Timp economisit",
      calculating: "Se calculează…",
      building: "Se analizează…",
      learning: "Analizăm conversația…",
      demoReady: "Demo pregătit ✓",
    },
    metrics: {
      response: "timp mediu de răspuns",
      available: "disponibil permanent",
      saved: "economisite săptămânal",
      qualified: "mai multe lead-uri calificate",
    },
    product: {
      kicker: "UN SINGUR AI. MUNCĂ REALĂ.",
      title: "Mai mult decât un chatbot.",
      description:
        "DavidPilot gestionează activitățile repetitive care încetinesc echipa ta, de la primul mesaj până la programarea întâlnirii.",
      cards: [
        [
          "Răspunde instant",
          "Oferă răspunsuri rapide și consecvente pe website și pe canalele tale de comunicare.",
        ],
        [
          "Califică fiecare lead",
          "Colectează informațiile necesare înainte ca echipa ta să preia conversația.",
        ],
        [
          "Programează întâlniri",
          "Se conectează la calendar și oferă automat intervalele disponibile.",
        ],
        [
          "Trimite follow-up-uri",
          "Continuă conversațiile automat, astfel încât oportunitățile importante să nu fie pierdute.",
        ],
      ],
    },
    industries: {
      kicker: "CREAT PENTRU AFACERI DE SERVICII",
      title: "Se adaptează modului tău de lucru.",
      description:
        "Începe cu un proces important și extinde automatizarea pe măsură ce afacerea crește.",
      items: [
        "Instalații HVAC",
        "Instalații sanitare",
        "Clinici stomatologice",
        "Clinici medicale",
        "Imobiliare",
        "Construcții",
        "Service-uri auto",
        "Cabinete de avocatură",
      ],
    },
    pricing: {
      kicker: "ÎNCEPE SIMPLU",
      title: "Primul tău angajat AI.",
      description:
        "Configurăm DavidPilot în funcție de afacerea, serviciile și fluxurile tale.",
      starting: "DE LA",
      month: "/lună",
      setup: "Configurarea inițială se stabilește separat.",
      button: "Solicită oferta",
    },
    faq: {
      kicker: "ÎNTREBĂRI",
      title: "Răspunsuri clare.",
      items: [
        [
          "Ce este un angajat AI?",
          "Un angajat AI este un asistent digital instruit pentru afacerea ta. Poate răspunde la întrebări, califica lead-uri, programa întâlniri și trimite follow-up-uri automat.",
        ],
        [
          "DavidPilot funcționează în afara programului?",
          "Da. DavidPilot este disponibil 24/7, inclusiv seara, în weekend și în zilele libere.",
        ],
        [
          "Se poate conecta la instrumentele pe care le folosesc deja?",
          "Da. DavidPilot se poate conecta la website, email, calendar, CRM și alte sisteme folosite în afacerea ta.",
        ],
      ],
    },
    final: {
      kicker: "EȘTI PREGĂTIT?",
      title: "Automatizează conversațiile cu clienții.",
      description:
        "Descoperă cum poate funcționa DavidPilot pentru afacerea ta într-un demo gratuit de 30 de minute.",
      button: "Programează demo-ul gratuit",
    },
    footer: "Angajatul tău AI.",
  },
  en: {
    navigation: {
      product: "Product",
      industries: "Industries",
      pricing: "Pricing",
      demo: "Book a demo",
    },
    hero: {
      eyebrow: "An AI employee for your business",
      titleStart: "Hire your first",
      titleHighlight: "AI employee.",
      description:
        "DavidPilot answers customers instantly, qualifies leads and books appointments 24/7, so you and your team can focus on growing the business.",
      problemStrong: "Stop losing customers",
      problemRest: "when you cannot answer the phone.",
      primaryButton: "Book a free demo",
      secondaryButton: "See the demo",
      proof: [
        "Replies in under 10 seconds",
        "Google Calendar integration",
        "AI trained for your business",
        "Romanian & English",
      ],
      liveDemo: "LIVE DEMO",
    },
    demo: {
      available: "Available now",
      greeting:
        "Hi! 👋 Welcome to DavidPilot. What can I help your business with today?",
      placeholder: "Type your message…",
      suggestions: [
        "I want to automate customer inquiries",
        "I need more qualified leads",
        "I want to book appointments automatically",
      ],
      replies: [
        "Great. What type of business do you run?",
        "Perfect. Approximately how many customer inquiries do you receive each week?",
        "Excellent. DavidPilot can answer those inquiries, qualify each lead and book appointments automatically. Your free demo is ready.",
      ],
      liveWorkflow: "LIVE WORKFLOW",
      qualifiedLead: "Lead qualified",
      business: "Business",
      serviceCompany: "Service company",
      weeklyInquiries: "Weekly inquiries",
      leadScore: "Lead score",
      estimatedTime: "Estimated time saved",
      calculating: "Calculating…",
      building: "Building…",
      learning: "Learning from conversation…",
      demoReady: "Demo ready ✓",
    },
    metrics: {
      response: "average response",
      available: "always available",
      saved: "saved each week",
      qualified: "more qualified leads",
    },
    product: {
      kicker: "ONE AI. REAL WORK.",
      title: "More than a chatbot.",
      description:
        "DavidPilot handles the repetitive customer work that slows your team down, from first message to booked appointment.",
      cards: [
        [
          "Answers instantly",
          "Helpful, consistent replies across your website and customer channels.",
        ],
        [
          "Qualifies every lead",
          "Collects the details your team needs before anyone picks up the phone.",
        ],
        [
          "Books appointments",
          "Connects to your calendar and offers available times automatically.",
        ],
        [
          "Follows up",
          "Keeps conversations moving so valuable opportunities are not forgotten.",
        ],
      ],
    },
    industries: {
      kicker: "BUILT FOR SERVICE BUSINESSES",
      title: "Fits the way you work.",
      description:
        "Start with one high-value workflow, then expand as your business grows.",
      items: [
        "HVAC",
        "Plumbing",
        "Dental clinics",
        "Medical clinics",
        "Real estate",
        "Construction",
        "Auto services",
        "Law firms",
      ],
    },
    pricing: {
      kicker: "START SIMPLE",
      title: "Your first AI employee.",
      description:
        "We configure DavidPilot around your business, services and customer journey.",
      starting: "STARTING FROM",
      month: "/month",
      setup: "Custom setup quoted separately.",
      button: "Get your plan",
    },
    faq: {
      kicker: "QUESTIONS",
      title: "Clear answers.",
      items: [
        [
          "What is an AI employee?",
          "An AI employee is a digital assistant trained on your business. It can answer questions, qualify leads, book appointments and follow up automatically.",
        ],
        [
          "Does DavidPilot work outside business hours?",
          "Yes. DavidPilot is available 24/7, including evenings, weekends and holidays.",
        ],
        [
          "Can it connect to my current tools?",
          "Yes. DavidPilot can connect to your website, email, calendar, CRM and other business systems.",
        ],
      ],
    },
    final: {
      kicker: "READY WHEN YOU ARE",
      title: "Put your customer conversations on autopilot.",
      description:
        "See how DavidPilot would work for your business in a free 30-minute demo.",
      button: "Book my free demo",
    },
    footer: "Your AI employee.",
  },
} as const;

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark" aria-hidden="true">
        <span className="eye" />
        <span className="eye" />
        <span className="smile" />
      </div>
      <span>DavidPilot</span>
    </div>
  );
}


function LeadCapture({
  language,
  lead,
  messages,
}: {
  language: Language;
  lead: LeadData;
  messages: Message[];
}) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const copy =
    language === "ro"
      ? {
          title: "Primește o demonstrație configurată pentru afacerea ta",
          description:
            "Lasă-ne datele tale și îți trimitem pașii următori. Durează mai puțin de un minut.",
          name: "Nume",
          company: "Companie",
          email: "Email",
          phone: "Telefon",
          button: "Trimite solicitarea",
          sending: "Se trimite…",
          success:
            "Solicitarea a fost trimisă. Te vom contacta pentru stabilirea demonstrației.",
          error: "Solicitarea nu a putut fi trimisă. Încearcă din nou.",
          privacy:
            "Datele sunt folosite doar pentru a te contacta în legătură cu demonstrația.",
          book: "Programează direct în calendar",
        }
      : {
          title: "Get a demo configured for your business",
          description:
            "Leave your contact details and we will send you the next steps. It takes less than a minute.",
          name: "Name",
          company: "Company",
          email: "Email",
          phone: "Phone",
          button: "Send request",
          sending: "Sending…",
          success:
            "Your request was sent. We will contact you to arrange the demo.",
          error: "The request could not be sent. Please try again.",
          privacy:
            "Your details are used only to contact you about the demonstration.",
          book: "Book directly in the calendar",
        };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          language,
          lead,
          conversation: messages.slice(-10),
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || copy.error);
      }

      setStatus("success");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : copy.error
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="lead-capture success">
        <div className="success-icon">✓</div>
        <h3>{copy.success}</h3>
        {process.env.NEXT_PUBLIC_BOOKING_URL && (
          <a
            className="button"
            href={process.env.NEXT_PUBLIC_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
          >
            {copy.book} →
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="lead-capture" onSubmit={submit}>
      <span className="kicker">NEXT STEP</span>
      <h3>{copy.title}</h3>
      <p>{copy.description}</p>

      <div className="lead-form-grid">
        <label>
          <span>{copy.name}</span>
          <input
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </label>

        <label>
          <span>{copy.company}</span>
          <input
            required
            minLength={2}
            maxLength={120}
            autoComplete="organization"
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
          />
        </label>

        <label>
          <span>{copy.email}</span>
          <input
            required
            type="email"
            maxLength={160}
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </label>

        <label>
          <span>{copy.phone}</span>
          <input
            required
            type="tel"
            maxLength={30}
            autoComplete="tel"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button className="button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? copy.sending : `${copy.button} →`}
      </button>

      <small>{copy.privacy}</small>
    </form>
  );
}

function Demo({ language }: { language: Language }) {
  const t = translations[language].demo;
  const emptyLead: LeadData = {
    business: null,
    weeklyInquiries: null,
    score: null,
    estimatedTimeSaved: null,
    qualified: false,
  };

  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: t.greeting },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lead, setLead] = useState<LeadData>(emptyLead);
  const [error, setError] = useState<string | null>(null);
  const userMessageCount = messages.filter((message) => message.sender === "user").length;
  const demoEnded = userMessageCount >= 8;

  useEffect(() => {
    setMessages([{ sender: "ai", text: t.greeting }]);
    setLead(emptyLead);
    setInput("");
    setTyping(false);
    setError(null);
  }, [language, t.greeting]);

  const leadView = useMemo(
    () => ({
      business: lead.business ?? "—",
      inquiries: lead.weeklyInquiries ?? "—",
      score: lead.score !== null ? `${lead.score}/100` : t.building,
      saved: lead.estimatedTimeSaved ?? t.calculating,
    }),
    [lead, t]
  );

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || typing || demoEnded) return;

    if (text.length > 500) {
      setError(
        language === "ro"
          ? "Mesajul poate avea maximum 500 de caractere."
          : "Messages can contain at most 500 characters."
      );
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      { sender: "user", text },
    ];

    setMessages(nextMessages);
    setInput("");
    setTyping(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          messages: nextMessages,
          lead,
        }),
      });

      const data = (await response.json()) as ChatResponse | { error: string };

      if (!response.ok || !("message" in data)) {
        throw new Error("error" in data ? data.error : "Request failed");
      }

      setMessages((current) => [
        ...current,
        { sender: "ai", text: data.message },
      ]);
      setLead(data.lead);
    } catch (requestError) {
      console.error(requestError);
      const message =
        requestError instanceof Error ? requestError.message : "";
      setError(
        message ||
          (language === "ro"
            ? "Demo-ul nu a putut răspunde. Te rugăm să încerci din nou."
            : "The demo could not respond. Please try again.")
      );
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="demo-wrap">
      <div className="live-demo">
        <span className="live-dot" />
        {translations[language].hero.liveDemo}
      </div>

      <div className="demo-shell">
        <div className="chat-card">
          <div className="chat-header">
            <div className="avatar">D</div>
            <div>
              <strong>DavidPilot AI</strong>
              <span>
                <i /> {t.available}
              </span>
            </div>
          </div>

          <div className="messages">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.text}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${message.sender}`}
                >
                  {message.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <div className="message ai typing">
                <b />
                <b />
                <b />
              </div>
            )}

            {error && <div className="chat-error">{error}</div>}
          </div>

          {messages.length === 1 && (
            <div className="suggestions">
              {t.suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => send(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {demoEnded && (
            <div className="chat-error">
              {language === "ro"
                ? "Demo-ul interactiv s-a încheiat. Programează o demonstrație completă pentru afacerea ta."
                : "The interactive demo has ended. Book a full demonstration for your business."}
            </div>
          )}

          <div className="chat-input">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 500))}
              onKeyDown={(event) => event.key === "Enter" && send()}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              disabled={typing || demoEnded}
              maxLength={500}
            />
            <button
              onClick={() => send()}
              aria-label="Send message"
              disabled={typing || demoEnded}
            >
              ↗
            </button>
          </div>
        </div>

        <motion.div
          className="lead-card"
          animate={{ y: lead.score !== null ? -4 : 0 }}
          transition={{ type: "spring", stiffness: 180 }}
        >
          <div className="lead-title">
            <span>✓</span>
            <div>
              <small>{t.liveWorkflow}</small>
              <strong>{t.qualifiedLead}</strong>
            </div>
          </div>

          <dl>
            <div>
              <dt>{t.business}</dt>
              <dd>{leadView.business}</dd>
            </div>
            <div>
              <dt>{t.weeklyInquiries}</dt>
              <dd>{leadView.inquiries}</dd>
            </div>
            <div>
              <dt>{t.leadScore}</dt>
              <dd>{leadView.score}</dd>
            </div>
            <div>
              <dt>{t.estimatedTime}</dt>
              <dd>{leadView.saved}</dd>
            </div>
          </dl>

          <div className={`status ${lead.qualified ? "done" : ""}`}>
            {lead.qualified ? t.demoReady : t.learning}
          </div>
        </motion.div>
      </div>

      {(lead.qualified || demoEnded) && (
        <LeadCapture language={language} lead={lead} messages={messages} />
      )}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ro");
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("davidpilot-language", language);
  }, [language]);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(
      "davidpilot-language"
    ) as Language | null;

    if (savedLanguage === "ro" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <main>
      <header className="nav container">
        <a href="#" aria-label="DavidPilot home">
          <Logo />
        </a>

        <nav>
          <a href="#product">{t.navigation.product}</a>
          <a href="#industries">{t.navigation.industries}</a>
          <a href="#pricing">{t.navigation.pricing}</a>
        </nav>

        <div className="nav-actions">
          <div className="language-selector" aria-label="Select language">
            <button
              className={language === "ro" ? "active" : ""}
              onClick={() => setLanguage("ro")}
              aria-pressed={language === "ro"}
            >
              RO
            </button>
            <span>/</span>
            <button
              className={language === "en" ? "active" : ""}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>

          <a
            className="button small"
            href="mailto:gabriel@davidpilot.com?subject=DavidPilot demo"
          >
            {t.navigation.demo}
          </a>
        </div>
      </header>

      <section className="hero container">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="eyebrow">
            <span /> {t.hero.eyebrow}
          </div>

          <h1>
            {t.hero.titleStart}
            <em>{t.hero.titleHighlight}</em>
          </h1>

          <p>{t.hero.description}</p>

          <div className="hero-problem">
            <strong>{t.hero.problemStrong}</strong> {t.hero.problemRest}
          </div>

          <div className="hero-actions">
            <a
              className="button"
              href="mailto:gabriel@davidpilot.com?subject=DavidPilot demo"
            >
              {t.hero.primaryButton} <span>→</span>
            </a>
            <a className="text-link" href="#demo">
              {t.hero.secondaryButton} ↓
            </a>
          </div>

          <div className="proof">
            <span>⚡ {t.hero.proof[0]}</span>
            <span>📅 {t.hero.proof[1]}</span>
            <span>🤖 {t.hero.proof[2]}</span>
            <span>🇷🇴 {t.hero.proof[3]}</span>
          </div>
        </motion.div>

        <div id="demo">
          <Demo language={language} />
        </div>
      </section>

      <section className="metric-band">
        <div className="container metrics">
          <div>
            <strong>&lt;10 sec</strong>
            <span>{t.metrics.response}</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>{t.metrics.available}</span>
          </div>
          <div>
            <strong>15 hrs</strong>
            <span>{t.metrics.saved}</span>
          </div>
          <div>
            <strong>3×</strong>
            <span>{t.metrics.qualified}</span>
          </div>
        </div>
      </section>

      <section id="product" className="section container">
        <div className="section-heading">
          <div>
            <span className="kicker">{t.product.kicker}</span>
            <h2>{t.product.title}</h2>
          </div>
          <p>{t.product.description}</p>
        </div>

        <div className="feature-grid">
          {t.product.cards.map(([title, copy], index) => (
            <article key={title} className="feature-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="industries" className="section alt">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="kicker">{t.industries.kicker}</span>
              <h2>{t.industries.title}</h2>
            </div>
            <p>{t.industries.description}</p>
          </div>

          <div className="industry-grid">
            {t.industries.items.map((industry) => (
              <div key={industry}>
                {industry}
                <span>↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section container">
        <div className="pricing-card">
          <div>
            <span className="kicker">{t.pricing.kicker}</span>
            <h2>{t.pricing.title}</h2>
            <p>{t.pricing.description}</p>
          </div>

          <div className="price-box">
            <small>{t.pricing.starting}</small>
            <strong>
              €99<span>{t.pricing.month}</span>
            </strong>
            <p>{t.pricing.setup}</p>
            <a
              className="button"
              href="mailto:gabriel@davidpilot.com?subject=DavidPilot pricing"
            >
              {t.pricing.button} →
            </a>
          </div>
        </div>
      </section>

      <section className="section container faq">
        <div>
          <span className="kicker">{t.faq.kicker}</span>
          <h2>{t.faq.title}</h2>
        </div>

        <div>
          {t.faq.items.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <span className="kicker">{t.final.kicker}</span>
          <h2>{t.final.title}</h2>
          <p>{t.final.description}</p>
          <a
            className="button light"
            href="mailto:gabriel@davidpilot.com?subject=DavidPilot demo"
          >
            {t.final.button} →
          </a>
        </div>
      </section>

      <footer className="footer container">
        <Logo />
        <p>© 2026 DavidPilot. {t.footer}</p>
        <a href="mailto:gabriel@davidpilot.com">
          gabriel@davidpilot.com
        </a>
      </footer>
    </main>
  );
}
