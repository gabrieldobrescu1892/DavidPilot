export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {name,email,company,phone,service,message,language,website}=req.body||{};
  if(website) return res.status(200).json({ok:true});
  if(!name||!email) return res.status(400).json({error:'Missing required fields'});
  const url=process.env.N8N_WEBHOOK_URL;
  if(!url) return res.status(503).json({error:'Webhook not configured'});
  try{
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-davidpilot-secret':process.env.N8N_WEBHOOK_SECRET||''},body:JSON.stringify({name,email,company,phone,service,message,language,source:'davidpilot.com',submittedAt:new Date().toISOString()})});
    if(!r.ok) throw new Error('Webhook failed');
    return res.status(200).json({ok:true});
  }catch(e){return res.status(502).json({error:'Submission failed'});}
}
