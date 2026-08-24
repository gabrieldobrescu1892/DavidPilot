import { NextRequest, NextResponse } from "next/server";
import { portalUser, supabaseAuthPassword, updatePortalPassword } from "@/lib/client-portal";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const user=await portalUser();if(!user?.email)return NextResponse.json({error:"Unauthorized."},{status:401});
 const body=await request.json().catch(()=>({})) as {current_password?:string;new_password?:string};
 if(!body.current_password||!body.new_password||body.new_password.length<8)return NextResponse.json({error:"Enter your current password and a new password of at least 8 characters."},{status:400});
 try{await supabaseAuthPassword(user.email,body.current_password);await updatePortalPassword(user.accessToken,body.new_password);return NextResponse.json({ok:true});}catch(error){console.error("Portal password change failed",error);return NextResponse.json({error:"Current password is incorrect or the password could not be changed."},{status:400});}
}
