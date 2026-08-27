"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../portal.css";

export default function PortalLogin(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[error,setError]=useState("");const[loading,setLoading]=useState(false);const router=useRouter();
 async function submit(e:React.FormEvent){
  e.preventDefault();
  if(loading)return;
  setLoading(true);setError("");
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),15000);
  try{
   const r=await fetch("/api/portal/login",{method:"POST",cache:"no-store",credentials:"include",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok){setError(data.error||"Could not sign in.");return}
   window.location.assign("/portal");
  }catch(error){
   setError(error instanceof DOMException&&error.name==="AbortError"?"Sign in took too long. Please try again.":"Could not reach the sign-in service. Please try again.");
  }finally{window.clearTimeout(timeout);setLoading(false)}
 }
 return <main className="portal-login"><section className="portal-login-card"><div className="portal-brand"><span>DP</span><div><strong>DAVIDPILOT</strong><small>Client Portal</small></div></div><span className="portal-kicker">SECURE CLIENT WORKSPACE</span><h1>Welcome back.</h1><p>Access projects, meetings, proposals, documents and support in one private workspace.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label><div className="portal-login-links"><a href="/portal/forgot-password">Forgot password?</a></div>{error&&<div className="portal-error">{error}</div>}<button disabled={loading}>{loading?"Signing in…":"Sign in securely"}</button></form><small className="portal-help">Need access? Contact your DavidPilot project lead.</small></section></main>
}
