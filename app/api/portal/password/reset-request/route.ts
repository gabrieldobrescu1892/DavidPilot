import { NextRequest, NextResponse } from "next/server";
import { sendPortalPasswordReset } from "@/lib/client-portal";
export const runtime = "nodejs";
export async function POST(request: NextRequest){
 const body=await request.json().catch(()=>({})) as {email?:string}; const email=body.email?.trim().toLowerCase();
 if(!email) return NextResponse.json({error:"Email is required."},{status:400});
 try{const origin=request.nextUrl.origin;await sendPortalPasswordReset(email,`${origin}/portal/reset-password`);return NextResponse.json({ok:true,message:"If an account exists for this email, a password reset link has been sent."});}
 catch(error){console.error("Portal password reset request failed",error);return NextResponse.json({error:"Could not send the reset email. Please try again."},{status:502});}
}
