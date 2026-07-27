"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type Message = {
  sender: "ai" | "user";
  text: string;
};

const initialMessages: Message[] = [
  {
    sender: "ai",
    text: "Hi! 👋 Welcome to DavidPilot. What can I help your business with today?",
  },
];

const suggestions = [
  "I want to automate customer inquiries",
  "I need more qualified leads",
  "I want to book appointments automatically",
];

const industries = [
  "HVAC",
  "Plumbing",
  "Dental clinics",
  "Medical clinics",
  "Real estate",
  "Construction",
  "Auto services",
  "Law firms",
];

const faqs = [
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
    "Yes. We can connect DavidPilot to your website, email, calendar, CRM and other business systems.",
  ],
];

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

function Demo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);

  const lead = useMemo(
    () => ({
      business: step >= 2 ? "Service company" : "—",
      inquiries: step >= 3 ? "80+" : "—",
      score: step >= 3 ? "92/100" : "Building…",
      saved: step >= 3 ? "15 hrs/week" : "Calculating…",
    }),
    [step]
  );

  const send = (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || typing) return;

    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setTyping(true);

    const replies = [
      "Great. What type of business do you run?",
      "Perfect. Approximately how many customer inquiries do you receive each week?",
      "Excellent. DavidPilot can answer those inquiries, qualify each lead and book appointments automatically. Your free demo is ready.",
    ];

    const nextStep = Math.min(step + 1, 3);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { sender: "ai", text: replies[Math.min(step, replies.length - 1)] },
      ]);
      setStep(nextStep);
      setTyping(false);
    }, 650);
  };

  return (
    <div className="demo-shell">
      <div className="chat-card">
        <div className="chat-header">
          <div className="avatar">D</div>
          <div>
            <strong>DavidPilot AI</strong>
            <span><i /> Available 24/7</span>
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
        </div>

        {messages.length === 1 && (
          <div className="suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => send(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send()}
            placeholder="Type your message…"
            aria-label="Message DavidPilot"
          />
          <button onClick={() => send()} aria-label="Send message">↗</button>
        </div>
      </div>

      <motion.div
        className="lead-card"
        animate={{ y: step ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 180 }}
      >
        <div className="lead-title">
          <span>✓</span>
          <div>
            <small>LIVE WORKFLOW</small>
            <strong>Lead qualified</strong>
          </div>
        </div>
        <dl>
          <div><dt>Business</dt><dd>{lead.business}</dd></div>
          <div><dt>Weekly inquiries</dt><dd>{lead.inquiries}</dd></div>
          <div><dt>Lead score</dt><dd>{lead.score}</dd></div>
          <div><dt>Estimated time saved</dt><dd>{lead.saved}</dd></div>
        </dl>
        <div className={`status ${step >= 3 ? "done" : ""}`}>
          {step >= 3 ? "Demo ready ✓" : "Learning from conversation…"}
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="nav container">
        <a href="#" aria-label="DavidPilot home"><Logo /></a>
        <nav>
          <a href="#product">Product</a>
          <a href="#industries">Industries</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <a className="button small" href="mailto:gabriel@davidpilot.com?subject=DavidPilot demo">
          Book a demo
        </a>
      </header>

      <section className="hero container">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="eyebrow"><span /> Built for growing businesses</div>
          <h1>Hire your first <em>AI employee.</em></h1>
          <p>
            DavidPilot answers customers, qualifies leads and books
            appointments—so your team can focus on growing the business.
          </p>
          <div className="hero-actions">
            <a className="button" href="mailto:gabriel@davidpilot.com?subject=Book a DavidPilot demo">
              Book a free demo <span>→</span>
            </a>
            <a className="text-link" href="#demo">Try DavidPilot ↓</a>
          </div>
          <div className="proof">
            <span>✓ 24/7 availability</span>
            <span>✓ Setup in days</span>
            <span>✓ Works with your tools</span>
          </div>
        </motion.div>

        <div id="demo"><Demo /></div>
      </section>

      <section className="metric-band">
        <div className="container metrics">
          <div><strong>&lt;10 sec</strong><span>average response</span></div>
          <div><strong>24/7</strong><span>always available</span></div>
          <div><strong>15 hrs</strong><span>saved each week</span></div>
          <div><strong>3×</strong><span>more qualified leads</span></div>
        </div>
      </section>

      <section id="product" className="section container">
        <div className="section-heading">
          <div>
            <span className="kicker">ONE AI. REAL WORK.</span>
            <h2>More than a chatbot.</h2>
          </div>
          <p>
            DavidPilot handles the repetitive customer work that slows your
            team down, from first message to booked appointment.
          </p>
        </div>

        <div className="feature-grid">
          {[
            ["01", "Answers instantly", "Helpful, consistent replies across your website and customer channels."],
            ["02", "Qualifies every lead", "Collects the details your team needs before anyone picks up the phone."],
            ["03", "Books appointments", "Connects to your calendar and offers available times automatically."],
            ["04", "Follows up", "Keeps conversations moving so valuable opportunities are not forgotten."],
          ].map(([number, title, copy]) => (
            <article key={number} className="feature-card">
              <span>{number}</span>
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
              <span className="kicker">BUILT FOR SERVICE BUSINESSES</span>
              <h2>Fits the way you work.</h2>
            </div>
            <p>Start with one high-value workflow, then expand as your business grows.</p>
          </div>
          <div className="industry-grid">
            {industries.map((industry) => (
              <div key={industry}>{industry}<span>↗</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section container">
        <div className="pricing-card">
          <div>
            <span className="kicker">START SIMPLE</span>
            <h2>Your first AI employee.</h2>
            <p>
              We configure DavidPilot around your business, services and
              customer journey.
            </p>
          </div>
          <div className="price-box">
            <small>STARTING FROM</small>
            <strong>€99<span>/month</span></strong>
            <p>Custom setup quoted separately.</p>
            <a className="button" href="mailto:gabriel@davidpilot.com?subject=DavidPilot pricing">
              Get your plan →
            </a>
          </div>
        </div>
      </section>

      <section className="section container faq">
        <div>
          <span className="kicker">QUESTIONS</span>
          <h2>Clear answers.</h2>
        </div>
        <div>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <span className="kicker">READY WHEN YOU ARE</span>
          <h2>Put your customer conversations on autopilot.</h2>
          <p>See how DavidPilot would work for your business in a free 30-minute demo.</p>
          <a className="button light" href="mailto:gabriel@davidpilot.com?subject=Free DavidPilot demo">
            Book my free demo →
          </a>
        </div>
      </section>

      <footer className="footer container">
        <Logo />
        <p>© 2026 DavidPilot. Your AI employee.</p>
        <a href="mailto:gabriel@davidpilot.com">gabriel@davidpilot.com</a>
      </footer>
    </main>
  );
}
