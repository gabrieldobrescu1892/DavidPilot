"use client";
import Image from "next/image";
import { PageFrame } from "../../components/SiteShell";
const t={en:{k:"FOUNDER & CEO",title:"Engineering leadership. Enterprise vision. AI innovation.",lead:"Leadership at DavidPilot combines enterprise engineering discipline, practical AI strategy and a clear focus on measurable business outcomes.",body:["With more than a decade of experience across software engineering, cloud infrastructure, DevOps, platform engineering and engineering management, Gabriel has built and led technology environments where security, reliability and scale are non-negotiable.","DavidPilot was created around a simple belief: AI should not be another disconnected experiment. It should be engineered into the way a business operates—securely, responsibly and with a clear economic purpose."],exp:"Experience",roles:["Engineering leadership","Enterprise platforms","Cloud & DevOps","AI automation architecture"],ph:"Technology is only valuable when it produces results."},ro:{k:"FONDATOR & CEO",title:"Leadership în inginerie. Viziune enterprise. Inovație AI.",lead:"Leadership-ul DavidPilot combină disciplina ingineriei enterprise, strategia AI practică și orientarea clară către rezultate măsurabile de business.",body:["Cu peste un deceniu de experiență în software, infrastructură cloud, DevOps, platform engineering și management tehnic, Gabriel a construit și coordonat medii în care securitatea, fiabilitatea și scalarea sunt esențiale.","DavidPilot a fost creat pornind de la o convingere simplă: AI-ul nu trebuie să fie încă un experiment izolat. Trebuie integrat în modul de funcționare al unei companii—securizat, responsabil și cu un scop economic clar."],exp:"Experiență",roles:["Leadership în inginerie","Platforme enterprise","Cloud & DevOps","Arhitectură de automatizare AI"],ph:"Tehnologia are valoare doar atunci când produce rezultate."}};
export default function About(){return <PageFrame>{({lang})=>{const c=t[lang];return <><section className="page-hero container"><span className="eyebrow">LEADERSHIP · {c.k}</span><h1>{c.title}</h1><p>{c.lead}</p></section><section className="container executive-grid"><figure className="founder-portrait-card">
  <div className="founder-photo-wrap">
    <Image
      src="/images/gabriel-dobrescu-founder.jpg"
      alt="Gabriel Dobrescu, Founder and CEO of DavidPilot"
      fill
      priority
      sizes="(max-width: 900px) 100vw, 40vw"
      className="founder-photo"
    />
  </div>
  <figcaption>
    <strong>Gabriel Dobrescu</strong>
    <span>Founder &amp; CEO</span>
  </figcaption>
</figure><div className="executive-copy">{c.body.map(p=><p key={p}>{p}</p>)}<blockquote>“{c.ph}”</blockquote><div className="contact-line"><a href="mailto:gabriel@davidpilot.com">gabriel@davidpilot.com</a><a href="tel:+40740985987">+40 740 985 987</a><a href="https://wa.me/40740985987" target="_blank">WhatsApp ↗</a></div></div></section><section className="section container"><span className="eyebrow">{c.exp.toUpperCase()}</span><div className="timeline">{c.roles.map((r,i)=><div key={r}><span>0{i+1}</span><h3>{r}</h3></div>)}</div></section></>}}</PageFrame>}
