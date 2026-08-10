import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminSupabase } from "@/lib/client-portal";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function json(response: Response){ return await response.json().catch(()=>[]); }
async function insert(table:string, body:Record<string,unknown>){
  const r = await adminSupabase(table,{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(body)});
  const rows = await json(r); return Array.isArray(rows)?rows[0]:rows;
}
async function patch(table:string,id:string,body:Record<string,unknown>){
  const r = await adminSupabase(`${table}?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(body)});
  const rows = await json(r); return Array.isArray(rows)?rows[0]:rows;
}
async function activity(clientId:string,label:string,type:string,metadata:Record<string,unknown>={}){
  await adminSupabase("client_activity",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({client_id:clientId,type,label,metadata})});
}

export async function GET(_request:NextRequest,{params}:Params){
  if(!(await isAdminAuthenticated())) return NextResponse.json({error:"Unauthorized."},{status:401});
  const {id}=await params;
  try{
    const [clientR,projectsR,milestonesR,meetingsR,documentsR,supportR,activityR,proposalsR] = await Promise.all([
      adminSupabase(`clients?id=eq.${id}&select=*,client_users(id,email,role,created_at)`),
      adminSupabase(`projects?client_id=eq.${id}&select=*&order=created_at.desc`),
      adminSupabase(`project_milestones?client_id=eq.${id}&select=*&order=sort_order.asc,created_at.asc`),
      adminSupabase(`client_meetings?client_id=eq.${id}&select=*&order=starts_at.desc`),
      adminSupabase(`client_documents?client_id=eq.${id}&select=*&order=created_at.desc`),
      adminSupabase(`support_requests?client_id=eq.${id}&select=*&order=created_at.desc`),
      adminSupabase(`client_activity?client_id=eq.${id}&select=*&order=created_at.desc&limit=50`),
      adminSupabase(`proposals?select=id,title,status,language,investment_min,investment_max,timeline,created_at,client_id&order=created_at.desc`),
    ]);
    const clients=await json(clientR);
    return NextResponse.json({
      client:Array.isArray(clients)?clients[0]:clients,
      projects:await json(projectsR), milestones:await json(milestonesR), meetings:await json(meetingsR),
      documents:await json(documentsR), support:await json(supportR), activity:await json(activityR), proposals:await json(proposalsR)
    });
  }catch(error){ console.error("Client detail load failed",error); return NextResponse.json({error:"Could not load client workspace."},{status:502}); }
}

export async function POST(request:NextRequest,{params}:Params){
  if(!(await isAdminAuthenticated())) return NextResponse.json({error:"Unauthorized."},{status:401});
  const {id:clientId}=await params; const body=await request.json().catch(()=>({})); const action=String(body.action||"");
  try{
    if(action==="create_project"){
      const project=await insert("projects",{client_id:clientId,name:String(body.name||"").trim(),description:String(body.description||"").trim()||null,status:body.status||"planning",progress:Number(body.progress||0),starts_at:body.starts_at||null,target_date:body.target_date||null});
      await activity(clientId,`Project created: ${project.name}`,"project_created",{project_id:project.id}); return NextResponse.json({ok:true,project});
    }
    if(action==="update_project"){
      const project=await patch("projects",String(body.id),{name:body.name,description:body.description||null,status:body.status,progress:Number(body.progress||0),starts_at:body.starts_at||null,target_date:body.target_date||null,updated_at:new Date().toISOString()});
      await activity(clientId,`Project updated: ${project?.name||body.name}`,"project_updated",{project_id:body.id}); return NextResponse.json({ok:true,project});
    }
    if(action==="create_milestone"){
      const milestone=await insert("project_milestones",{client_id:clientId,project_id:body.project_id,title:String(body.title||"").trim(),status:body.status||"pending",due_at:body.due_at||null,sort_order:Number(body.sort_order||0)});
      await activity(clientId,`Milestone added: ${milestone.title}`,"milestone_created",{project_id:body.project_id,milestone_id:milestone.id}); return NextResponse.json({ok:true,milestone});
    }
    if(action==="update_milestone"){
      const milestone=await patch("project_milestones",String(body.id),{title:body.title,status:body.status,due_at:body.due_at||null,sort_order:Number(body.sort_order||0)});
      await activity(clientId,`Milestone updated: ${milestone?.title||body.title}`,"milestone_updated",{milestone_id:body.id}); return NextResponse.json({ok:true,milestone});
    }
    if(action==="create_meeting"){
      const meeting=await insert("client_meetings",{client_id:clientId,project_id:body.project_id||null,title:String(body.title||"").trim(),starts_at:body.starts_at,ends_at:body.ends_at||null,status:body.status||"scheduled",meeting_url:body.meeting_url||null,notes:body.notes||null});
      await activity(clientId,`Meeting added: ${meeting.title}`,"meeting_created",{meeting_id:meeting.id}); return NextResponse.json({ok:true,meeting});
    }
    if(action==="create_document"){
      const document=await insert("client_documents",{client_id:clientId,project_id:body.project_id||null,title:String(body.title||"").trim(),category:body.category||null,url:body.url||null,description:body.description||null});
      await activity(clientId,`Document shared: ${document.title}`,"document_created",{document_id:document.id}); return NextResponse.json({ok:true,document});
    }
    if(action==="link_proposal"){
      const proposal=await patch("proposals",String(body.proposal_id),{client_id:clientId,status:body.status||"shared",updated_at:new Date().toISOString()});
      await activity(clientId,`Proposal shared: ${proposal?.title||"Proposal"}`,"proposal_shared",{proposal_id:body.proposal_id}); return NextResponse.json({ok:true,proposal});
    }
    if(action==="update_support"){
      const ticket=await patch("support_requests",String(body.id),{status:body.status,priority:body.priority,admin_response:body.admin_response||null,updated_at:new Date().toISOString()});
      await activity(clientId,`Support request updated: ${ticket?.subject||"Support request"}`,"support_updated",{support_id:body.id}); return NextResponse.json({ok:true,ticket});
    }
    if(action==="update_client"){
      const client=await patch("clients",clientId,{name:body.name,primary_contact_name:body.primary_contact_name||null,primary_contact_email:body.primary_contact_email||null,status:body.status,updated_at:new Date().toISOString()});
      await activity(clientId,"Client profile updated","client_updated"); return NextResponse.json({ok:true,client});
    }
    return NextResponse.json({error:"Unknown action."},{status:400});
  }catch(error){ console.error("Client operation failed",{action,error}); return NextResponse.json({error:error instanceof Error?error.message:"Client operation failed."},{status:502}); }
}
