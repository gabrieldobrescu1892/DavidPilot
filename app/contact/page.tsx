"use client";
import { FormEvent, useState } from "react";
import { PageFrame } from "../../components/SiteShell";

const t = {
  en: { k:"CONTACT", title:"Start with the business problem.", lead:"Tell us where work slows down, where customers wait or where your teams lose time. We will help identify the right AI and automation approach.", name:"Name", email:"Business email", phone:"Phone", company:"Company", message:"What would you like to improve?", send:"Request consultation", sent:"Thank you. Your request has been received.", error:"The request could not be sent. Please contact us directly." },
  ro: { k:"CONTACT", title:"Începe cu problema de business.", lead:"Spune-ne unde munca încetinește, unde clienții așteaptă sau unde echipele pierd timp. Te ajutăm să identifici abordarea potrivită de AI și automatizare.", name:"Nume", email:"Email de business", phone:"Telefon", company:"Companie", message:"Ce ai vrea să îmbunătățești?", send:"Solicită consultația", sent:"Mulțumim. Solicitarea ta a fost înregistrată.", error:"Solicitarea nu a putut fi trimisă. Contactează-ne direct." }
};

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  return <PageFrame>{({ lang }) => {
    const c = t[lang];
    async function submit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setError(false);
      const form = new FormData(e.currentTarget);
      const message = String(form.get("message") || "");
      const payload = {
        name: form.get("name"), company: form.get("company"), email: form.get("email"), phone: form.get("phone"), language: lang,
        lead: { business: form.get("company"), weeklyInquiries: null, mainProblem: message, score: null, estimatedTimeSaved: null, qualified: false },
        conversation: [{ sender: "user", text: message }]
      };
      try {
        const response = await fetch("/api/leads", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
        if (!response.ok) throw new Error("Submission failed");
        setSent(true);
      } catch { setError(true); }
    }
    return <><section className="page-hero container"><span className="eyebrow">{c.k}</span><h1>{c.title}</h1><p>{c.lead}</p></section><section className="container contact-grid"><div className="contact-details"><span>DIRECT CONTACT</span><a href="mailto:gabriel@davidpilot.com">gabriel@davidpilot.com</a><a href="tel:+40740985987">+40 740 985 987</a><a href="https://wa.me/40740985987" target="_blank" rel="noreferrer">WhatsApp ↗</a><p>Romania · Serving European and international clients</p></div>{sent?<div className="success-panel">{c.sent}</div>:<form className="contact-form" onSubmit={submit}><label>{c.name}<input name="name" required minLength={2}/></label><label>{c.email}<input name="email" type="email" required/></label><label>{c.phone}<input name="phone" type="tel" required minLength={6}/></label><label>{c.company}<input name="company" required minLength={2}/></label><label>{c.message}<textarea name="message" rows={6} required/></label>{error && <p className="form-error">{c.error}</p>}<button className="button" type="submit">{c.send}</button></form>}</section></>;
  }}</PageFrame>;
}
