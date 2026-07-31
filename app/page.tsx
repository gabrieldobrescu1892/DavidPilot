"use client";
import Link from "next/link";
import { PageFrame } from "../components/SiteShell";

const t = {
  en: {
    eyebrow: "ENTERPRISE AI ENGINEERING",
    title: "AI systems engineered for real business.",
    intro: "We design secure AI agents, intelligent workflows and enterprise integrations that reduce operational friction and create measurable advantage.",
    primary: "Book a consultation", secondary: "Explore solutions",
    proof: ["Engineering-led delivery", "Secure by design", "Built for integration", "Bilingual implementation"],
    solutionsTitle: "From isolated tasks to intelligent operations.",
    solutionsIntro: "DavidPilot combines AI, automation and systems engineering to build solutions that work inside your existing business—not around it.",
    solutions: [
      ["AI Agents", "Purpose-built agents for support, sales, operations and internal knowledge."],
      ["Process Automation", "Reliable workflows that remove repetitive work across teams and systems."],
      ["Enterprise Integrations", "Secure connections across CRM, ERP, email, calendars, data and custom platforms."],
      ["AI Strategy", "Practical roadmaps focused on business value, governance and responsible adoption."],
    ],
    difference: "Engineering first. AI with purpose.",
    differenceText: "We treat AI as production infrastructure: architected carefully, integrated securely, monitored continuously and improved against real business outcomes.",
    principles: ["Architecture before automation", "Security and privacy by default", "Human oversight where it matters", "Clear value and measurable outcomes"],
    founderTitle: "Leadership grounded in engineering.",
    founderText: "Founded by Gabriel Dobrescu, an engineering leader with more than a decade of experience across software engineering, cloud, DevOps, enterprise platforms and technical leadership.",
    founderLink: "Meet the founder",
    finalTitle: "Build the right AI system—not another disconnected tool.",
    finalText: "Start with a focused consultation. We will identify the strongest use cases, the required integrations and a realistic path to production.",
  },
  ro: {
    eyebrow: "ENTERPRISE AI ENGINEERING",
    title: "Sisteme AI proiectate pentru afaceri reale.",
    intro: "Proiectăm agenți AI securizați, fluxuri inteligente și integrări enterprise care reduc blocajele operaționale și creează un avantaj măsurabil.",
    primary: "Programează o consultație", secondary: "Explorează soluțiile",
    proof: ["Livrare condusă de inginerie", "Securitate prin design", "Creat pentru integrare", "Implementare bilingvă"],
    solutionsTitle: "De la sarcini izolate la operațiuni inteligente.",
    solutionsIntro: "DavidPilot combină AI, automatizare și ingineria sistemelor pentru a construi soluții care funcționează în interiorul companiei tale, nu în jurul ei.",
    solutions: [
      ["Agenți AI", "Agenți specializați pentru suport, vânzări, operațiuni și cunoaștere internă."],
      ["Automatizarea proceselor", "Fluxuri fiabile care elimină activitatea repetitivă din echipe și sisteme."],
      ["Integrări enterprise", "Conexiuni securizate între CRM, ERP, email, calendare, date și platforme custom."],
      ["Strategie AI", "Planuri pragmatice concentrate pe valoare, guvernanță și adopție responsabilă."],
    ],
    difference: "Inginerie înainte de toate. AI cu un scop clar.",
    differenceText: "Tratăm AI-ul ca infrastructură de producție: arhitecturat atent, integrat securizat, monitorizat continuu și îmbunătățit prin rezultate reale.",
    principles: ["Arhitectură înainte de automatizare", "Securitate și confidențialitate implicită", "Control uman acolo unde contează", "Valoare clară și rezultate măsurabile"],
    founderTitle: "Leadership construit pe experiență tehnică.",
    founderText: "Fondat de Gabriel Dobrescu, lider în inginerie cu peste un deceniu de experiență în software, cloud, DevOps, platforme enterprise și coordonare tehnică.",
    founderLink: "Descoperă fondatorul",
    finalTitle: "Construiește sistemul AI potrivit, nu încă un instrument izolat.",
    finalText: "Începe cu o consultație clară. Identificăm cele mai bune cazuri de utilizare, integrările necesare și un traseu realist către producție.",
  },
};

export default function Home() { return <PageFrame>{({ lang }) => { const c = t[lang]; return <>
  <section className="hero container">
    <div className="hero-copy"><span className="eyebrow">{c.eyebrow}</span><h1>{c.title}</h1><p>{c.intro}</p><div className="hero-actions"><Link className="button" href="/contact">{c.primary}</Link><Link className="button button-ghost" href="/solutions">{c.secondary}</Link></div></div>
    <div className="system-visual" aria-hidden="true"><div className="system-grid"/><div className="system-core"><small>DAVIDPILOT</small><strong>AI OPERATING LAYER</strong><span>Secure • Integrated • Observable</span></div><div className="orbit orbit-one"/><div className="orbit orbit-two"/></div>
  </section>
  <section className="proof-strip container">{c.proof.map(x => <span key={x}>{x}</span>)}</section>
  <section className="section container"><div className="section-heading"><span className="eyebrow">CAPABILITIES</span><h2>{c.solutionsTitle}</h2><p>{c.solutionsIntro}</p></div><div className="solution-grid">{c.solutions.map((x,i)=><article className="premium-card" key={x[0]}><span className="card-number">0{i+1}</span><h3>{x[0]}</h3><p>{x[1]}</p><Link href="/solutions">↗</Link></article>)}</div></section>
  <section className="dark-section"><div className="container split"><div><span className="eyebrow">OUR STANDARD</span><h2>{c.difference}</h2><p>{c.differenceText}</p></div><div className="principles">{c.principles.map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong></div>)}</div></div></section>
  <section className="section container founder-preview"><div className="founder-monogram">GD</div><div><span className="eyebrow">FOUNDER & CEO</span><h2>{c.founderTitle}</h2><p>{c.founderText}</p><Link className="text-link" href="/about">{c.founderLink} →</Link></div></section>
  <section className="section container"><div className="cta-panel"><span className="eyebrow">START A CONVERSATION</span><h2>{c.finalTitle}</h2><p>{c.finalText}</p><Link className="button button-light" href="/contact">{c.primary}</Link></div></section>
</>; }}</PageFrame>; }
