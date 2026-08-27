import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminSupabase, createPortalAuthUser, sendPortalPasswordReset } from "@/lib/client-portal";

export const runtime = "nodejs";
async function data(path:string, init:RequestInit={}){const r=await adminSupabase(path,init);return r.json();}
async function insert(table:string, body:any){const rows=await data(table,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(body)});return rows[0];}

export async function GET(){
 if(!(await isAdminAuthenticated())) return NextResponse.json({error:"Unauthorized."},{status:401});
 try{
  const [proposals,clients]=await Promise.all([
   data("proposals?select=id,lead_id,client_id,title,status,investment_min,investment_max,timeline,content,accepted_at,created_at&status=eq.accepted&order=accepted_at.desc.nullslast"),
   data("clients?select=id,name,primary_contact_name,primary_contact_email,status,metadata&order=created_at.desc")
  ]);
  const leadIds=[...new Set(proposals.map((p:any)=>p.lead_id).filter(Boolean))];
  let leads:any[]=[];
  if(leadIds.length) leads=await data(`leads?select=id,name,company,email,phone,business_type,recommended_solution,status&id=in.(${leadIds.join(",")})`);
  const byLead=new Map(leads.map((l:any)=>[l.id,l]));
  return NextResponse.json({items:proposals.map((p:any)=>({...p,lead:byLead.get(p.lead_id)||null})),clients});
 }catch(error){console.error("Onboarding load failed",error);return NextResponse.json({error:"Could not load onboarding queue."},{status:502});}
}

export async function POST(request:NextRequest){
 if(!(await isAdminAuthenticated())) return NextResponse.json({error:"Unauthorized."},{status:401});
 const body=await request.json().catch(()=>({}));
 if(body.action!=="provision"||!body.proposal_id) return NextResponse.json({error:"Invalid onboarding request."},{status:400});
 try{
  const proposals=await data(`proposals?select=*&id=eq.${encodeURIComponent(body.proposal_id)}&limit=1`); const proposal=proposals[0];
  if(!proposal||proposal.status!=="accepted") return NextResponse.json({error:"Only accepted proposals can be onboarded."},{status:409});
  const leads=proposal.lead_id?await data(`leads?select=*&id=eq.${proposal.lead_id}&limit=1`):[]; const lead=leads[0]||{};
  const company=String(body.company||lead.company||"Client").trim(); const contact=String(body.contact_name||lead.name||"").trim(); const email=String(body.email||lead.email||"").trim().toLowerCase();
  if(!company||!contact||!email) return NextResponse.json({error:"Company, contact and email are required."},{status:400});
  let clientId=proposal.client_id||null;
  if(!clientId){
   const existing=await data(`clients?select=id&primary_contact_email=eq.${encodeURIComponent(email)}&limit=1`); clientId=existing[0]?.id||null;
  }
  if(!clientId){
   const client=await insert("clients",{name:company,primary_contact_name:contact,primary_contact_email:email,status:"onboarding",metadata:{source:"accepted_proposal",proposal_id:proposal.id,lead_id:proposal.lead_id}}); clientId=client.id;
  } else {
   await adminSupabase(`clients?id=eq.${clientId}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status:"onboarding",updated_at:new Date().toISOString()})});
  }
  const memberships=await data(`client_users?select=id&client_id=eq.${clientId}&limit=1`);
  let resetSent=false;
  if(!memberships.length){
   const temp=randomBytes(24).toString("base64url")+"Aa1!";
   const user=await createPortalAuthUser(email,temp,contact);
   await adminSupabase("client_users",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({client_id:clientId,user_id:user.id,email,role:"client_admin"})});
   const origin=request.nextUrl.origin.replace(/\/$/,"");
   await sendPortalPasswordReset(email,`${origin}/portal/reset-password`).then(()=>{resetSent=true}).catch(e=>console.error("Onboarding reset email failed",e));
  }
  const projectName=String(body.project_name||proposal.title||`${company} AI implementation`).trim();
  const existingProjects=await data(`projects?select=id&client_id=eq.${clientId}&name=eq.${encodeURIComponent(projectName)}&limit=1`);
  let project=existingProjects[0];
  if(!project) project=await insert("projects",{client_id:clientId,name:projectName,description:body.project_description||proposal.content?.recommended_solution||null,status:"planning",progress:0,starts_at:body.starts_at||null,target_date:body.target_date||null});
  const existingTasks=await data(`onboarding_tasks?select=id&client_id=eq.${clientId}&project_id=eq.${project.id}&limit=1`);
  if(!existingTasks.length){
   const tasks=[
    ["Proposal accepted","Commercial scope approved by client","completed"],
    ["Client workspace created","DavidPilot workspace provisioned","completed"],
    ["Company information","Confirm billing, legal and operational details","pending"],
    ["Technical contacts","Add technical and business stakeholders","pending"],
    ["Systems & integrations","Confirm systems, APIs, calendars and CRM integrations","pending"],
    ["Access requirements","Collect required accounts and access approvals","pending"],
    ["Kick-off meeting","Schedule and complete the project kick-off","pending"],
    ["Project started","Move the delivery project to active","pending"]
   ];
   await adminSupabase("onboarding_tasks",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify(tasks.map((x,i)=>({client_id:clientId,project_id:project.id,title:x[0],description:x[1],status:x[2],sort_order:i,completed_at:x[2]==="completed"?new Date().toISOString():null})))});
  }
  await adminSupabase(`proposals?id=eq.${proposal.id}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({client_id:clientId,updated_at:new Date().toISOString()})});
  await adminSupabase("client_activity",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({client_id:clientId,type:"onboarding_started",label:`Onboarding started from accepted proposal: ${proposal.title}`,metadata:{proposal_id:proposal.id,project_id:project.id}})});
  return NextResponse.json({ok:true,client_id:clientId,project_id:project.id,reset_sent:resetSent});
 }catch(error){console.error("Client onboarding failed",error);return NextResponse.json({error:error instanceof Error?error.message:"Could not provision client onboarding."},{status:502});}
}
