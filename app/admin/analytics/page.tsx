"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./analytics.css";

type EventRow = { id:string; created_at:string; event_name:string; session_id:string|null; lead_id:string|null; language:"en"|"ro"|null; source:string|null; page:string|null; metadata:Record<string,unknown> };
type Lead = { id:string; created_at:string; qualified:boolean; status:string; lead_score:number|null; industry:string|null; language:"en"|"ro"; estimated_value_min:number|null; estimated_value_max:number|null; recommended_service:string|null; meeting_status:string|null };
type Proposal = { id:string; created_at:string; status:string; investment_min:number|null; investment_max:number|null };

type Payload = { events:EventRow[]; leads:Lead[]; proposals:Proposal[]; from:string };

const rangeLabels:Record<string,string>={"7d":"7 days","30d":"30 days","90d":"90 days","365d":"12 months"};
const eventLabels:Record<string,string>={page_view:"Page views",chat_opened:"Chat opens",chat_message_sent:"Chat messages",lead_submitted:"Leads",booking_opened:"Booking opens",copy_trial_generated:"Copy trials",proposal_generated:"Proposals"};

function pct(a:number,b:number){return b>0?Math.round((a/b)*100):0}
function eur(value:number){return new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(value)}
function dayKey(value:string){return new Date(value).toISOString().slice(0,10)}

export default function AnalyticsPage(){
  const[authorized,setAuthorized]=useState<boolean|null>(null);const[data,setData]=useState<Payload|null>(null);const[range,setRange]=useState("30d");const[loading,setLoading]=useState(true);const[error,setError]=useState("");
  useEffect(()=>{setLoading(true);setError("");fetch(`/api/admin/analytics?range=${range}`,{cache:"no-store",credentials:"include"}).then(async r=>{if(r.status===401){setAuthorized(false);return null}const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load analytics");setAuthorized(true);setData(d);return d}).catch(e=>setError(e.message||"Could not load analytics")).finally(()=>setLoading(false))},[range]);

  const view=useMemo(()=>{
    const events=data?.events||[],leads=data?.leads||[],proposals=data?.proposals||[];
    const count=(name:string)=>events.filter(e=>e.event_name===name).length;
    const visitors=new Set(events.filter(e=>e.event_name==="page_view"&&e.session_id).map(e=>e.session_id)).size;
    const chatOpens=count("chat_opened"),leadCount=leads.length,qualified=leads.filter(l=>l.qualified).length,meetings=leads.filter(l=>l.meeting_status==="booked"||l.status==="demo_booked").length;
    const won=leads.filter(l=>l.status==="customer").length,proposalCount=Math.max(proposals.length,count("proposal_generated"));
    const pipeline=leads.filter(l=>l.status!=="closed").reduce((sum,l)=>sum+(l.estimated_value_max??l.estimated_value_min??0),0);
    const avgScore=leadCount?Math.round(leads.reduce((sum,l)=>sum+(l.lead_score??0),0)/leadCount):0;
    const stages=[{label:"Visitors",value:visitors},{label:"Chat opened",value:chatOpens},{label:"Leads",value:leadCount},{label:"Qualified",value:qualified},{label:"Meetings",value:meetings},{label:"Proposals",value:proposalCount},{label:"Won",value:won}];
    const byDay:Record<string,{views:number;chats:number;leads:number}>={};
    events.forEach(e=>{const k=dayKey(e.created_at);byDay[k]??={views:0,chats:0,leads:0};if(e.event_name==="page_view")byDay[k].views++;if(e.event_name==="chat_opened")byDay[k].chats++;if(e.event_name==="lead_submitted")byDay[k].leads++});
    leads.forEach(l=>{const k=dayKey(l.created_at);byDay[k]??={views:0,chats:0,leads:0};if(!events.some(e=>e.event_name==="lead_submitted"&&dayKey(e.created_at)===k))byDay[k].leads++});
    const trend=Object.entries(byDay).sort(([a],[b])=>a.localeCompare(b)).slice(-31).map(([date,v])=>({date,...v}));
    const industries=Object.entries(leads.reduce((acc,l)=>{const k=l.industry||"Unspecified";acc[k]=(acc[k]||0)+1;return acc},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const services=Object.entries(leads.reduce((acc,l)=>{const k=l.recommended_service||"Unspecified";acc[k]=(acc[k]||0)+1;return acc},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const sources=Object.entries(events.filter(e=>e.event_name==="lead_submitted").reduce((acc,e)=>{const k=e.source||"website";acc[k]=(acc[k]||0)+1;return acc},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]);
    const language={en:leads.filter(l=>l.language==="en").length,ro:leads.filter(l=>l.language==="ro").length};
    return{visitors,chatOpens,leadCount,qualified,meetings,won,proposalCount,pipeline,avgScore,stages,trend,industries,services,sources,language,bookingOpens:count("booking_opened"),copyTrials:count("copy_trial_generated"),messages:count("chat_message_sent")};
  },[data]);

  if(authorized===false)return <main className="analytics-auth"><div><span>DAVIDPILOT</span><h1>Analytics</h1><p>Your admin session is not active.</p><Link href="/admin">Sign in through Lead Cockpit</Link></div></main>;
  const maxTrend=Math.max(1,...view.trend.map(d=>Math.max(d.views,d.chats,d.leads)));
  const maxIndustry=Math.max(1,...view.industries.map(([,v])=>v));
  const maxService=Math.max(1,...view.services.map(([,v])=>v));

  return <main className="analytics-shell">

    <nav className="admin-nav"><Link href="/admin">Lead Cockpit</Link><Link className="active" href="/admin/analytics">Analytics</Link><Link href="/admin/copy-studio">AI Copy Studio</Link><Link href="/admin/proposals">Proposals</Link><Link href="/admin/clients">Clients</Link></nav>

    <nav className="admin-nav"><Link href="/admin">Lead Cockpit</Link><Link className="active" href="/admin/analytics">Analytics</Link><Link href="/admin/copy-studio">AI Copy Studio</Link><Link href="/admin/proposals">Proposals</Link></nav>
    <header className="analytics-header"><div><span>DAVIDPILOT · BUSINESS INTELLIGENCE</span><h1>Analytics Dashboard</h1><p>Track acquisition, AI engagement and sales conversion across the DavidPilot funnel.</p></div><select value={range} onChange={e=>setRange(e.target.value)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="365d">Last 12 months</option></select></header>
    {error&&<div className="analytics-error">{error}</div>}
    {loading&&!data?<div className="analytics-loading">Loading analytics…</div>:<>
      <section className="metric-grid">
        <article><span>Unique visitors</span><strong>{view.visitors}</strong><small>{rangeLabels[range]}</small></article>
        <article><span>AI conversations</span><strong>{view.chatOpens}</strong><small>{view.messages} messages sent</small></article>
        <article><span>Qualified leads</span><strong>{view.qualified}</strong><small>{pct(view.qualified,view.leadCount)}% of leads</small></article>
        <article><span>Meetings booked</span><strong>{view.meetings}</strong><small>{view.bookingOpens} booking opens</small></article>
        <article><span>Pipeline potential</span><strong>{eur(view.pipeline)}</strong><small>Indicative upper range</small></article>
        <article><span>Average lead score</span><strong>{view.avgScore}</strong><small>out of 100</small></article>
      </section>

      <section className="analytics-grid wide">
        <article className="panel funnel-panel"><div className="panel-head"><div><span>CONVERSION FUNNEL</span><h2>From visitor to customer</h2></div><small>{rangeLabels[range]}</small></div><div className="funnel-list">{view.stages.map((stage,i)=>{const prev=i===0?stage.value:view.stages[i-1].value;return <div key={stage.label}><div><strong>{stage.label}</strong><span>{stage.value}</span></div><div className="funnel-bar"><i style={{width:`${Math.max(4,pct(stage.value,view.stages[0].value||1))}%`}}/></div><small>{i===0?"Baseline":`${pct(stage.value,prev)}% from previous stage`}</small></div>})}</div></article>
        <article className="panel"><div className="panel-head"><div><span>CONVERSION</span><h2>Key rates</h2></div></div><div className="rate-stack"><div><span>Visitor → chat</span><strong>{pct(view.chatOpens,view.visitors)}%</strong></div><div><span>Chat → lead</span><strong>{pct(view.leadCount,view.chatOpens)}%</strong></div><div><span>Lead → qualified</span><strong>{pct(view.qualified,view.leadCount)}%</strong></div><div><span>Qualified → meeting</span><strong>{pct(view.meetings,view.qualified)}%</strong></div><div><span>Meeting → proposal</span><strong>{pct(view.proposalCount,view.meetings)}%</strong></div><div><span>Proposal → won</span><strong>{pct(view.won,view.proposalCount)}%</strong></div></div></article>
      </section>

      <section className="panel trend-panel"><div className="panel-head"><div><span>TREND</span><h2>Website and funnel activity</h2></div><div className="legend"><i className="views"/>Views<i className="chats"/>Chats<i className="leads"/>Leads</div></div>{view.trend.length?<div className="trend-chart">{view.trend.map(d=><div className="trend-day" key={d.date} title={`${d.date}: ${d.views} views, ${d.chats} chats, ${d.leads} leads`}><div className="trend-bars"><i className="views" style={{height:`${Math.max(2,d.views/maxTrend*100)}%`}}/><i className="chats" style={{height:`${Math.max(2,d.chats/maxTrend*100)}%`}}/><i className="leads" style={{height:`${Math.max(2,d.leads/maxTrend*100)}%`}}/></div><small>{new Date(`${d.date}T00:00:00`).toLocaleDateString("en",{day:"numeric",month:"short"})}</small></div>)}</div>:<div className="empty">Event data will appear after the analytics migration is deployed.</div>}</section>

      <section className="analytics-grid thirds">
        <article className="panel"><div className="panel-head"><div><span>INDUSTRIES</span><h2>Lead mix</h2></div></div><div className="rank-list">{view.industries.map(([label,value])=><div key={label}><div><span>{label}</span><strong>{value}</strong></div><i><b style={{width:`${value/maxIndustry*100}%`}}/></i></div>)}</div></article>
        <article className="panel"><div className="panel-head"><div><span>SOLUTIONS</span><h2>Recommended services</h2></div></div><div className="rank-list">{view.services.map(([label,value])=><div key={label}><div><span>{label}</span><strong>{value}</strong></div><i><b style={{width:`${value/maxService*100}%`}}/></i></div>)}</div></article>
        <article className="panel"><div className="panel-head"><div><span>AUDIENCE</span><h2>Language & sources</h2></div></div><div className="audience"><div className="language-split"><div><strong>{view.language.ro}</strong><span>Romanian</span></div><div><strong>{view.language.en}</strong><span>English</span></div></div><h3>Lead sources</h3>{view.sources.length?view.sources.map(([source,value])=><div className="source-row" key={source}><span>{source.replaceAll("_"," ")}</span><strong>{value}</strong></div>):<p className="muted">Source tracking starts with this release.</p>}<div className="copy-trials"><span>Public Copy Studio trials</span><strong>{view.copyTrials}</strong></div></div></article>
      </section>
    </>}
  </main>;
}
