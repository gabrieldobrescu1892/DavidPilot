import { NextRequest, NextResponse } from "next/server";
import { portalCookie, portalCookieOptions, updatePortalPassword } from "@/lib/client-portal";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const body=await request.json().catch(()=>({})) as {access_token?:string;password?:string};
 if(!body.access_token||!body.password||body.password.length<8)return NextResponse.json({error:"A valid recovery session and a password of at least 8 characters are required."},{status:400});
 try{await updatePortalPassword(body.access_token,body.password);const response=NextResponse.json({ok:true});response.cookies.set(portalCookie.name,body.access_token,portalCookieOptions(request.nextUrl.hostname));return response;}catch(error){console.error("Portal recovery password update failed",error);return NextResponse.json({error:"This recovery link is invalid or expired. Request a new one."},{status:401});}
}
