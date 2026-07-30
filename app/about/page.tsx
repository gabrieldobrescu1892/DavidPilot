"use client";

import { useEffect, useState } from "react";
import "./about.css";

type Language = "ro" | "en";

const copy = {
  ro: {
    nav: { home: "Acasă", product: "Produs", about: "Despre fondator", demo: "Programează un demo" },
    hero: {
      kicker: "FONDATOR • CEO • ENGINEERING LEADER",
      title: "Tehnologia trebuie să simplifice munca, nu să o complice.",
      intro: "Sunt Gabriel Dobrescu, inginer și lider tehnic. Am fondat DavidPilot pentru a ajuta afacerile să folosească automatizarea AI într-un mod practic, sigur și ușor de înțeles.",
      cta: "Discută direct cu mine",
    },
    story: {
      kicker: "POVESTEA MEA",
      title: "De la infrastructură și DevOps la automatizare AI.",
      paragraphs: [
        "Cu peste un deceniu de experiență în software engineering, cloud, DevOps, platform engineering și engineering management, am proiectat și coordonat platforme enterprise unde fiabilitatea, securitatea și scalabilitatea sunt esențiale.",
        "Ca Engineering Manager, cred că tehnologia trebuie să rezolve probleme de business, nu să creeze altele. Am condus echipe de inginerie, am îmbunătățit procese operaționale și am automatizat sisteme critice folosite în producție.",
        "Am fondat DaviPilot AI deoarece am văzut cât timp pierd companiile cu activități repetitive. Astăzi combinăm practici de inginerie enterprise cu AI modern pentru a construi automatizări sigure, scalabile și ușor de integrat în procesele existente.",
      ],
    },
    principles: {
      kicker: "CUM LUCREZ",
      title: "Principii simple pentru automatizări serioase.",
      items: [
        ["Practic înainte de spectaculos", "O automatizare trebuie să economisească timp sau să îmbunătățească un rezultat concret. Tehnologia este mijlocul, nu produsul final."],
        ["Claritate și control", "Clientul trebuie să înțeleagă ce face sistemul, ce date folosește și când intervine o persoană."],
        ["Integrare, nu înlocuire forțată", "Pornim de la instrumentele și procesele deja folosite, apoi automatizăm treptat punctele cu cea mai mare valoare."],
        ["Fiabilitate și securitate", "Abordez soluțiile AI cu disciplina unui inginer responsabil de sisteme și servicii reale."],
      ],
    },
    experience: {
      kicker: "EXPERIENȚĂ",
      title: "O combinație de inginerie și leadership.",
      items: [
        ["Software & Linux", "Experiență practică în sisteme, aplicații și medii tehnice complexe."],
        ["Cloud & DevOps", "Automatizare, livrare software, infrastructură și operarea serviciilor."],
        ["Leadership tehnic", "Coordonarea echipelor și conectarea priorităților tehnice cu nevoile de business."],
        ["AI aplicat", "Construirea de asistenți și fluxuri care rezolvă activități comerciale și operaționale clare."],
      ],
    },
    mission: {
      kicker: "MISIUNEA DAVIDPILOT",
      title: "Să facem automatizarea AI accesibilă afacerilor care nu au nevoie de încă un proiect IT complicat.",
      text: "Începem cu o problemă concretă, construim o soluție ușor de măsurat și o extindem doar atunci când produce valoare.",
      button: "Programează o discuție",
    },
    footer: "Automatizare AI construită cu experiență tehnică.",
  },
  en: {
    nav: { home: "Home", product: "Product", about: "About the founder", demo: "Book a demo" },
    hero: {
      kicker: "FOUNDER • CEO • ENGINEERING LEADER",
      title: "Technology should simplify work, not make it harder.",
      intro: "I’m Gabriel Dobrescu, an engineer and technical leader. I founded DavidPilot to help businesses use AI automation in a practical, secure and understandable way.",
      cta: "Talk directly with me",
    },
    story: {
      kicker: "MY STORY",
      title: "From infrastructure and DevOps to AI automation.",
      paragraphs: [
        "With more than a decade of experience in software engineering, cloud infrastructure, DevOps, platform engineering and engineering leadership, I have designed, built and led enterprise technology platforms where reliability, security and scalability are essential.",
        "As an Engineering Manager, I believe technology should solve business problems, not create new ones. Throughout my career I have led engineering teams, improved operational excellence and automated complex processes used in production environments.",
        "I founded DaviPilot AI because I saw businesses spending too much time on repetitive work. Today we combine enterprise engineering practices with modern AI to build secure, scalable automations that integrate seamlessly into existing business processes.",
      ],
    },
    principles: {
      kicker: "HOW I WORK",
      title: "Simple principles for serious automation.",
      items: [
        ["Practical before impressive", "An automation should save time or improve a measurable outcome. Technology is the means, not the final product."],
        ["Clarity and control", "Clients should understand what the system does, what data it uses and when a person takes over."],
        ["Integration, not forced replacement", "We start with the tools and processes already in use, then automate the highest-value points gradually."],
        ["Reliability and security", "I approach AI solutions with the discipline of an engineer responsible for real systems and services."],
      ],
    },
    experience: {
      kicker: "EXPERIENCE",
      title: "A combination of engineering and leadership.",
      items: [
        ["Software & Linux", "Hands-on experience with systems, applications and complex technical environments."],
        ["Cloud & DevOps", "Automation, software delivery, infrastructure and service operations."],
        ["Technical leadership", "Leading teams and connecting technical priorities with business needs."],
        ["Applied AI", "Building assistants and workflows that solve clear commercial and operational tasks."],
      ],
    },
    mission: {
      kicker: "THE DAVIDPILOT MISSION",
      title: "Make AI automation accessible to businesses that do not need another complicated IT project.",
      text: "We begin with a concrete problem, build a solution that is easy to measure and expand it only when it creates value.",
      button: "Book a conversation",
    },
    footer: "AI automation built on technical experience.",
  },
} as const;

function Logo() {
  return <div className="logo"><div className="logo-mark" aria-hidden="true"><span className="eye"/><span className="eye"/><span className="smile"/></div><span>DavidPilot</span></div>;
}

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>("ro");
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem("davidpilot-language") as Language | null;
    if (saved === "ro" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("davidpilot-language", language);
  }, [language]);

  return (
    <main className="about-page">
      <header className="nav container">
        <a href="/" aria-label="DavidPilot home"><Logo /></a>
        <nav><a href="/">{t.nav.home}</a><a href="/#product">{t.nav.product}</a><a className="active-link" href="/about">{t.nav.about}</a></nav>
        <div className="nav-actions">
          <div className="language-selector" aria-label="Select language"><button className={language === "ro" ? "active" : ""} onClick={() => setLanguage("ro")}>RO</button><span>/</span><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button></div>
          <a className="button small" href="mailto:gabriel@davidpilot.com?subject=DavidPilot discussion">{t.nav.demo}</a>
        </div>
      </header>

      <section className="about-hero container">
        <div className="about-hero-copy"><span className="eyebrow"><span /> {t.hero.kicker}</span><h1>{t.hero.title}</h1><p>{t.hero.intro}</p><a className="button" href="mailto:gabriel@davidpilot.com?subject=DavidPilot discussion">{t.hero.cta} →</a></div>
        <div className="about-portrait"><div className="portrait-orbit"/><div className="portrait-initials">GD</div><div className="portrait-caption"><strong>Gabriel Dobrescu</strong><span>{t.hero.kicker}</span></div></div>
      </section>

      <section className="about-section about-story"><div className="container about-two-col"><div><span className="kicker">{t.story.kicker}</span><h2>{t.story.title}</h2></div><div className="story-copy">{t.story.paragraphs.map(p => <p key={p}>{p}</p>)}</div></div></section>

      <section className="about-section container"><div className="about-heading"><span className="kicker">{t.principles.kicker}</span><h2>{t.principles.title}</h2></div><div className="principle-grid">{t.principles.items.map(([title,text],i)=><article key={title}><span>{String(i+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="about-section experience-section"><div className="container"><div className="about-heading"><span className="kicker">{t.experience.kicker}</span><h2>{t.experience.title}</h2></div><div className="experience-grid">{t.experience.items.map(([title,text])=><article key={title}><div className="experience-dot"/><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="about-mission"><div className="container"><span className="kicker">{t.mission.kicker}</span><h2>{t.mission.title}</h2><p>{t.mission.text}</p><a className="button light" href="mailto:gabriel@davidpilot.com?subject=DavidPilot automation discussion">{t.mission.button} →</a></div></section>

      <footer className="footer container"><Logo/><p>© 2026 DavidPilot. {t.footer}</p><a href="mailto:gabriel@davidpilot.com">gabriel@davidpilot.com</a></footer>
    </main>
  );
}
