"use client";
import {BookingButton,PageFrame} from "../../components/SiteShell";

type ServiceItem={id:string;title:string;description:string};
const t={
  en:{
    k:"SOLUTIONS",
    title:"AI capabilities designed as business systems.",
    lead:"We combine strategy, software engineering and automation to move from opportunity to production.",
    items:[
      {id:"ai-receptionist",title:"AI Receptionist",description:"A multilingual front line for customer questions, lead qualification and appointment booking, connected to your calendar and business workflows."},
      {id:"ai-agents",title:"AI Agents",description:"Goal-oriented assistants for support, sales qualification, internal knowledge and operational work, built around your processes."},
      {id:"business-automation",title:"Business Automation",description:"End-to-end automation across repetitive tasks, approvals, follow-ups, document flows, notifications and system hand-offs."},
      {id:"enterprise-ai",title:"Enterprise AI",description:"Secure, scalable AI architecture with governance, monitoring and integrations for business-critical environments."},
      {id:"ai-consulting",title:"AI Consulting",description:"Use-case discovery, prioritisation, architecture, risk assessment and an implementation roadmap grounded in engineering."},
      {id:"custom-engineering",title:"Custom Engineering",description:"Bespoke software, APIs and infrastructure for AI implementations that require deeper integration or specialised workflows."}
    ] as ServiceItem[],
    cta:"Discuss your use case"
  },
  ro:{
    k:"SOLUȚII",
    title:"Capabilități AI proiectate ca sisteme de business.",
    lead:"Combinăm strategia, ingineria software și automatizarea pentru a transforma oportunitățile în sisteme de producție.",
    items:[
      {id:"ai-receptionist",title:"AI Receptionist",description:"Un punct de contact multilingv pentru întrebări, calificarea solicitărilor și programări, conectat la calendar și procesele companiei."},
      {id:"ai-agents",title:"Agenți AI",description:"Asistenți orientați spre obiective pentru suport, vânzări, cunoaștere internă și operațiuni, construiți pe fluxurile companiei."},
      {id:"business-automation",title:"Business Automation",description:"Automatizare completă pentru sarcini repetitive, aprobări, follow-up, documente, notificări și transferuri între sisteme."},
      {id:"enterprise-ai",title:"Enterprise AI",description:"Arhitectură AI sigură și scalabilă, cu guvernanță, monitorizare și integrări pentru medii critice de business."},
      {id:"ai-consulting",title:"Consultanță AI",description:"Identificarea și prioritizarea cazurilor de utilizare, arhitectură, evaluarea riscurilor și roadmap de implementare bazat pe inginerie."},
      {id:"custom-engineering",title:"Inginerie custom",description:"Software, API-uri și infrastructură personalizate pentru implementări AI care necesită integrări complexe sau fluxuri specializate."}
    ] as ServiceItem[],
    cta:"Discută cazul tău de utilizare"
  }
};

export default function Solutions(){
  return <PageFrame>{({lang})=>{
    const c=t[lang];
    return <>
      <section className="page-hero container"><span className="eyebrow">{c.k}</span><h1>{c.title}</h1><p>{c.lead}</p></section>
      <section className="container service-list">{c.items.map((x,i)=><article id={x.id} className="service-anchor" key={x.id}><span>0{i+1}</span><div><h2>{x.title}</h2><p>{x.description}</p></div></article>)}</section>
      <section className="section container"><div className="cta-panel"><h2>{c.cta}</h2><BookingButton className="button button-light">{c.cta}</BookingButton></div></section>
    </>;
  }}</PageFrame>;
}
