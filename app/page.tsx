"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookingButton, PageFrame } from "../components/SiteShell";

const t = {
  en: {
    eyebrow: "ENTERPRISE AI ENGINEERING",
    title: "AI engineered for real business impact.",
    intro: "From AI agents and intelligent automation to enterprise integrations, DavidPilot helps organizations streamline operations, empower teams and unlock measurable value with production-ready AI.",
    primary: "Book a free strategy session", secondary: "Explore solutions",
    proof: ["Enterprise engineering", "Founder-led delivery", "Secure AI", "Cloud native", "Tailored integrations"],
    solutionsEyebrow: "CAPABILITIES", solutionsTitle: "From isolated tasks to intelligent operations.",
    solutionsIntro: "DavidPilot combines AI, automation and systems engineering to build solutions that work inside your existing business—not around it.",
    solutions: [
      ["AI Agents", "Purpose-built agents for support, sales, operations and internal knowledge."],
      ["Process Automation", "Reliable workflows that remove repetitive work across teams and systems."],
      ["Enterprise Integrations", "Secure connections across CRM, ERP, email, calendars, data and custom platforms."],
      ["AI Strategy", "Practical roadmaps focused on business value, governance and responsible adoption."],
    ],
    whyEyebrow: "WHY DAVIDPILOT", whyTitle: "Engineering credibility. Commercial clarity.",
    whyIntro: "We combine enterprise engineering discipline with marketing-aware delivery, so every solution is technically sound and tied to a clear business outcome.",
    why: ["Engineering-first approach", "Enterprise experience", "Founder-led delivery", "Secure implementations", "Tailored integrations", "No generic AI solutions"],
    investmentEyebrow: "INVESTMENT", investmentTitle: "Choose the right AI solution for your business.",
    investmentIntro: "Every engagement starts with a free discovery call. We identify the strongest opportunity and recommend a solution aligned with your goals, systems and budget.",
    popular: "RECOMMENDED",
    plans: [
      { name: "AI Starter", price: "€490", suffix: "starting from", description: "For companies taking their first practical step into AI.", features: ["AI chat assistant", "Website integration", "Basic automation", "7–10 day delivery", "Email support"], cta: "Get started" },
      { name: "Business Automation", price: "€1,500", suffix: "starting from", description: "For growing teams ready to remove repetitive operational work.", features: ["Everything in Starter", "CRM integrations", "AI workflows", "Internal AI assistant", "API integrations", "Employee training"], cta: "Book consultation", featured: true },
      { name: "Enterprise AI", price: "Custom", suffix: "tailored engagement", description: "For organizations requiring secure, integrated AI systems at scale.", features: ["AI agents", "Private AI solutions", "Enterprise integrations", "Security and compliance", "Ongoing support", "Dedicated engineering"], cta: "Talk to Gabriel" },
    ],
    trust: ["Free discovery call", "No hidden costs", "Enterprise security", "Tailored to your business"],
    roiEyebrow: "AI ROI ESTIMATOR", roiTitle: "What could automation return to your business?", roiIntro: "Use this quick estimator to model the potential value of reducing repetitive work. Results are indicative, not a guarantee.",
    employees: "Employees affected", hours: "Repetitive hours / employee / week", cost: "Average hourly cost (€)", automation: "Automation potential", recovered: "Estimated hours recovered / month", annual: "Estimated annual productivity opportunity", roiCta: "Get your personalized AI roadmap",
    featuredEyebrow: "FEATURED AI SOLUTIONS", featuredTitle: "Practical AI for real operating problems.", featuredIntro: "Illustrative implementation patterns that show how DavidPilot can turn repetitive processes into measurable business value.", example: "EXAMPLE SOLUTION", challenge: "Challenge", solution: "Solution", value: "Business value", buildSimilar: "Build something similar",
    featured: [
      {industry:"Healthcare", title:"AI Receptionist", challenge:"Patients wait too long for responses and appointment handling.", solution:"A multilingual AI receptionist answers questions, qualifies requests and books appointments around the clock.", values:["24/7 availability","Faster booking","Lower admin workload"]},
      {industry:"E-commerce", title:"AI Customer Support", challenge:"Support teams lose time on repetitive order and product questions.", solution:"An AI assistant resolves common requests and escalates complex cases with full context.", values:["Faster response times","Lower support effort","Consistent customer experience"]},
      {industry:"Enterprise", title:"Internal AI Assistant", challenge:"Employees spend too much time searching documents and internal systems.", solution:"A secure assistant answers questions using approved company knowledge and permissions.", values:["Faster onboarding","Higher productivity","Controlled knowledge access"]},
      {industry:"Operations", title:"Workflow Automation", challenge:"Teams manually transfer data between disconnected business systems.", solution:"AI-powered workflows connect applications, validate data and automate repetitive handoffs.", values:["Fewer manual tasks","Reduced errors","Faster operations"]},
    ],
    processEyebrow:"HOW WE WORK", processTitle:"A clear path from opportunity to production.", processIntro:"We start with the business problem, then engineer the right solution around your systems, people and measurable outcomes.",
    process:[
      ["Discover","We understand how your business operates before recommending AI."],
      ["Design","We identify the highest-impact opportunities and define the architecture and roadmap."],
      ["Build","We develop, integrate and test a secure solution inside your existing environment."],
      ["Launch & Optimize","We deploy, monitor performance and continuously improve the solution."],
    ],
    processTrust:["Enterprise-grade security","Founder-led delivery","Transparent communication","Long-term partnership"],
    founderTitle:"Leadership grounded in engineering.", founderText:"Founded by Gabriel Dobrescu, an engineering leader with more than a decade of experience across software engineering, cloud, DevOps, enterprise platforms and technical leadership.", founderLink:"Explore leadership",
    finalTitle:"Ready to see what AI can do for your business?", finalText:"Whether you are exploring your first automation or planning an enterprise AI initiative, we will help you identify the opportunities that deliver real value.",
    faqTitle:"Before we begin", faqs:[["Do I need technical knowledge?","No. We handle the architecture, implementation and integration from start to finish."],["How long does a project take?","Most engagements take between one and six weeks, depending on scope and integration complexity."],["Can you work with our existing systems?","Yes. We integrate with CRMs, ERPs, Microsoft 365, Google Workspace, APIs and custom platforms."]],
  },
  ro: {
    eyebrow: "ENTERPRISE AI ENGINEERING",
    title: "AI proiectat pentru impact real în afaceri.",
    intro: "De la agenți AI și automatizare inteligentă la integrări enterprise, DavidPilot ajută organizațiile să simplifice operațiunile, să își susțină echipele și să obțină valoare măsurabilă prin AI pregătit pentru producție.",
    primary: "Programează o sesiune strategică gratuită", secondary: "Explorează soluțiile",
    proof: ["Inginerie enterprise", "Livrare condusă de fondator", "AI securizat", "Cloud native", "Integrări personalizate"],
    solutionsEyebrow: "CAPABILITĂȚI", solutionsTitle: "De la sarcini izolate la operațiuni inteligente.",
    solutionsIntro: "DavidPilot combină AI, automatizare și ingineria sistemelor pentru a construi soluții care funcționează în interiorul companiei tale, nu în jurul ei.",
    solutions: [["Agenți AI","Agenți specializați pentru suport, vânzări, operațiuni și cunoaștere internă."],["Automatizarea proceselor","Fluxuri fiabile care elimină activitatea repetitivă din echipe și sisteme."],["Integrări enterprise","Conexiuni securizate între CRM, ERP, email, calendare, date și platforme custom."],["Strategie AI","Planuri pragmatice concentrate pe valoare, guvernanță și adopție responsabilă."]],
    whyEyebrow:"DE CE DAVIDPILOT", whyTitle:"Credibilitate tehnică. Claritate comercială.", whyIntro:"Combinăm disciplina ingineriei enterprise cu o abordare comercială, astfel încât fiecare soluție să fie solidă tehnic și legată de un rezultat clar pentru business.",
    why:["Abordare engineering-first","Experiență enterprise","Livrare condusă de fondator","Implementări securizate","Integrări personalizate","Fără soluții AI generice"],
    investmentEyebrow:"INVESTIȚIE", investmentTitle:"Alege soluția AI potrivită pentru afacerea ta.", investmentIntro:"Fiecare colaborare începe cu o discuție gratuită. Identificăm oportunitatea cu cel mai mare impact și recomandăm o soluție aliniată obiectivelor, sistemelor și bugetului tău.", popular:"RECOMANDAT",
    plans:[{name:"AI Starter",price:"€490",suffix:"de la",description:"Pentru companiile care fac primul pas practic către AI.",features:["Asistent AI pentru website","Integrare în website","Automatizare de bază","Livrare în 7–10 zile","Suport prin email"],cta:"Începe acum"},{name:"Business Automation",price:"€1.500",suffix:"de la",description:"Pentru echipele în creștere care vor să elimine activitatea repetitivă.",features:["Tot ce include Starter","Integrări CRM","Fluxuri AI","Asistent AI intern","Integrări API","Training pentru angajați"],cta:"Programează o consultație",featured:true},{name:"Enterprise AI",price:"Personalizat",suffix:"proiect adaptat",description:"Pentru organizații care au nevoie de sisteme AI securizate și integrate la scară.",features:["Agenți AI","Soluții AI private","Integrări enterprise","Securitate și conformitate","Suport continuu","Inginerie dedicată"],cta:"Discută cu Gabriel"}],
    trust:["Consultație gratuită","Fără costuri ascunse","Securitate enterprise","Adaptat afacerii tale"],
    roiEyebrow:"ESTIMATOR ROI AI", roiTitle:"Ce valoare poate aduce automatizarea afacerii tale?", roiIntro:"Folosește acest estimator rapid pentru a modela valoarea potențială a reducerii activității repetitive. Rezultatele sunt orientative, nu o garanție.", employees:"Angajați implicați", hours:"Ore repetitive / angajat / săptămână", cost:"Cost mediu pe oră (€)", automation:"Potențial de automatizare", recovered:"Ore estimate recuperate / lună", annual:"Oportunitate anuală estimată de productivitate", roiCta:"Primește o strategie AI personalizată",
    featuredEyebrow:"SOLUȚII AI REPREZENTATIVE", featuredTitle:"AI practic pentru probleme operaționale reale.", featuredIntro:"Exemple de implementare care arată cum DavidPilot poate transforma procesele repetitive în valoare măsurabilă pentru business.", example:"EXEMPLU DE SOLUȚIE", challenge:"Provocare", solution:"Soluție", value:"Valoare pentru business", buildSimilar:"Construiește ceva similar",
    featured:[{industry:"Sănătate",title:"Recepționer AI",challenge:"Pacienții așteaptă prea mult pentru răspunsuri și programări.",solution:"Un recepționer AI multilingv răspunde, califică solicitările și programează consultații 24/7.",values:["Disponibilitate 24/7","Programări mai rapide","Mai puțină muncă administrativă"]},{industry:"E-commerce",title:"Suport clienți AI",challenge:"Echipele pierd timp cu întrebări repetitive despre produse și comenzi.",solution:"Un asistent AI rezolvă cererile uzuale și escaladează cazurile complexe cu tot contextul necesar.",values:["Răspunsuri mai rapide","Efort redus de suport","Experiență consecventă"]},{industry:"Enterprise",title:"Asistent AI intern",challenge:"Angajații pierd timp căutând documente și informații în sisteme interne.",solution:"Un asistent securizat răspunde folosind cunoștințe aprobate și reguli de acces.",values:["Onboarding mai rapid","Productivitate mai mare","Acces controlat la informații"]},{industry:"Operațiuni",title:"Automatizarea fluxurilor",challenge:"Echipele transferă manual date între sisteme de business neconectate.",solution:"Fluxurile cu AI conectează aplicațiile, validează datele și automatizează transferurile repetitive.",values:["Mai puține sarcini manuale","Erori reduse","Operațiuni mai rapide"]}],
    processEyebrow:"CUM LUCRĂM", processTitle:"Un traseu clar de la oportunitate la producție.", processIntro:"Pornim de la problema de business, apoi proiectăm soluția potrivită în jurul sistemelor, oamenilor și rezultatelor măsurabile.", process:[["Descoperire","Înțelegem cum funcționează afacerea ta înainte de a recomanda AI."],["Design","Identificăm oportunitățile cu impact mare și definim arhitectura și planul."],["Dezvoltare","Construim, integrăm și testăm o soluție securizată în mediul existent."],["Lansare & optimizare","Implementăm, monitorizăm performanța și îmbunătățim continuu soluția."]], processTrust:["Securitate enterprise","Livrare condusă de fondator","Comunicare transparentă","Parteneriat pe termen lung"],
    founderTitle:"Leadership construit pe experiență tehnică.", founderText:"Fondat de Gabriel Dobrescu, lider în inginerie cu peste un deceniu de experiență în software, cloud, DevOps, platforme enterprise și coordonare tehnică.", founderLink:"Descoperă leadership-ul",
    finalTitle:"Ești pregătit să vezi ce poate face AI pentru afacerea ta?", finalText:"Indiferent dacă explorezi prima automatizare sau planifici o inițiativă AI enterprise, te ajutăm să identifici oportunitățile care livrează valoare reală.",
    faqTitle:"Înainte să începem", faqs:[["Am nevoie de cunoștințe tehnice?","Nu. Ne ocupăm de arhitectură, implementare și integrare de la început până la final."],["Cât durează un proiect?","Majoritatea proiectelor durează între una și șase săptămâni, în funcție de complexitate și integrări."],["Puteți integra sistemele noastre existente?","Da. Lucrăm cu CRM-uri, ERP-uri, Microsoft 365, Google Workspace, API-uri și platforme custom."]],
  },
};

type Lang = keyof typeof t;

function RoiCalculator({ lang }: { lang: Lang }) {
  const c = t[lang];
  const [employees, setEmployees] = useState(12);
  const [hours, setHours] = useState(6);
  const [cost, setCost] = useState(25);
  const [automation, setAutomation] = useState(50);
  const results = useMemo(() => {
    const monthlyHours = employees * hours * 4.33 * (automation / 100);
    return { monthlyHours: Math.round(monthlyHours), annualValue: Math.round(monthlyHours * cost * 12) };
  }, [employees, hours, cost, automation]);
  return <section className="roi-section" id="roi"><div className="container roi-grid">
    <div className="roi-copy"><span className="eyebrow">{c.roiEyebrow}</span><h2>{c.roiTitle}</h2><p>{c.roiIntro}</p><BookingButton className="button button-light">{c.roiCta}</BookingButton></div>
    <div className="roi-card">
      <label>{c.employees}<input type="number" min="1" max="10000" value={employees} onChange={e=>setEmployees(Math.max(1, Number(e.target.value)||1))}/></label>
      <label>{c.hours}<input type="number" min="1" max="80" value={hours} onChange={e=>setHours(Math.max(1, Number(e.target.value)||1))}/></label>
      <label>{c.cost}<input type="number" min="1" max="1000" value={cost} onChange={e=>setCost(Math.max(1, Number(e.target.value)||1))}/></label>
      <label>{c.automation}: <strong>{automation}%</strong><input type="range" min="10" max="90" step="5" value={automation} onChange={e=>setAutomation(Number(e.target.value))}/></label>
      <div className="roi-results"><div><span>{c.recovered}</span><strong>{results.monthlyHours}</strong></div><div><span>{c.annual}</span><strong>€{results.annualValue.toLocaleString(lang === "ro" ? "ro-RO" : "en-US")}</strong></div></div>
    </div>
  </div></section>;
}

export default function Home() { return <PageFrame>{({ lang }) => { const c = t[lang]; return <>
  <section className="hero container"><div className="hero-copy"><span className="eyebrow">{c.eyebrow}</span><h1>{c.title}</h1><p>{c.intro}</p><div className="hero-actions"><BookingButton className="button">{c.primary}</BookingButton><a className="button button-ghost" href="#solutions">{c.secondary}</a></div></div><div className="system-visual" aria-hidden="true"><div className="system-grid"/><div className="system-core"><small>DAVIDPILOT</small><strong>AI OPERATING LAYER</strong><span>Secure • Integrated • Observable</span></div><div className="orbit orbit-one"/><div className="orbit orbit-two"/></div></section>
  <section className="proof-strip container">{c.proof.map(x=><span key={x}>{x}</span>)}</section>
  <section className="section container" id="solutions"><div className="section-heading"><span className="eyebrow">{c.solutionsEyebrow}</span><h2>{c.solutionsTitle}</h2><p>{c.solutionsIntro}</p></div><div className="solution-grid">{c.solutions.map((x,i)=><article className="premium-card" key={x[0]}><span className="card-number">0{i+1}</span><h3>{x[0]}</h3><p>{x[1]}</p><Link href="/solutions">↗</Link></article>)}</div></section>
  <section className="why-section"><div className="container why-grid"><div><span className="eyebrow">{c.whyEyebrow}</span><h2>{c.whyTitle}</h2><p>{c.whyIntro}</p></div><div className="why-list">{c.why.map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong></div>)}</div></div></section>
  <section className="investment-section" id="investment"><div className="container"><div className="investment-heading"><div><span className="eyebrow">{c.investmentEyebrow}</span><h2>{c.investmentTitle}</h2></div><p>{c.investmentIntro}</p></div><div className="pricing-grid">{c.plans.map(plan=><article className={`pricing-card${plan.featured?" featured":""}`} key={plan.name}>{plan.featured&&<span className="popular-badge">{c.popular}</span>}<div className="pricing-card-top"><h3>{plan.name}</h3><p>{plan.description}</p></div><div className="price"><small>{plan.suffix}</small><strong>{plan.price}</strong></div><ul>{plan.features.map(feature=><li key={feature}>{feature}</li>)}</ul><BookingButton className={`button${plan.featured?" button-pricing-featured":" button-pricing"}`}>{plan.cta}<span>↗</span></BookingButton></article>)}</div><div className="pricing-trust">{c.trust.map(item=><span key={item}><i>✓</i>{item}</span>)}</div></div></section>
  <RoiCalculator lang={lang}/>
  <section className="section container" id="featured-solutions"><div className="section-heading"><span className="eyebrow">{c.featuredEyebrow}</span><h2>{c.featuredTitle}</h2><p>{c.featuredIntro}</p></div><div className="featured-grid">{c.featured.map((item,i)=><article className="featured-card" key={item.title}><div className="featured-top"><span>{item.industry}</span><small>{c.example}</small></div><div className="featured-index">0{i+1}</div><h3>{item.title}</h3><div className="featured-copy"><b>{c.challenge}</b><p>{item.challenge}</p><b>{c.solution}</b><p>{item.solution}</p><b>{c.value}</b><ul>{item.values.map(v=><li key={v}>{v}</li>)}</ul></div><BookingButton className="text-link">{c.buildSimilar} →</BookingButton></article>)}</div></section>
  <section className="process-section" id="process"><div className="container"><div className="section-heading process-heading"><span className="eyebrow">{c.processEyebrow}</span><h2>{c.processTitle}</h2><p>{c.processIntro}</p></div><div className="process-grid">{c.process.map((step,i)=><article key={step[0]}><span>0{i+1}</span><h3>{step[0]}</h3><p>{step[1]}</p></article>)}</div><div className="process-trust">{c.processTrust.map(x=><span key={x}>✓ {x}</span>)}</div></div></section>
  <section className="section container founder-preview"><div className="founder-monogram">GD</div><div><span className="eyebrow">FOUNDER & CEO</span><h2>{c.founderTitle}</h2><p>{c.founderText}</p><Link className="text-link" href="/leadership">{c.founderLink} →</Link></div></section>
  <section className="section container"><div className="cta-panel"><span className="eyebrow">START A CONVERSATION</span><h2>{c.finalTitle}</h2><p>{c.finalText}</p><BookingButton className="button button-light">{c.primary}</BookingButton></div></section>
  <section className="section container compact-faq"><div><span className="eyebrow">FAQ</span><h2>{c.faqTitle}</h2></div><div className="faq-list light-faq">{c.faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
</>; }}</PageFrame>; }
