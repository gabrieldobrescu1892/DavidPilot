import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata={title:{default:"DavidPilot — Enterprise AI Engineering",template:"%s | DavidPilot"},description:"DavidPilot engineers secure AI agents, business automation and enterprise integrations.",metadataBase:new URL("https://davidpilot.com"),openGraph:{title:"DavidPilot — Enterprise AI Engineering",description:"AI systems engineered for real business.",url:"https://davidpilot.com",siteName:"DavidPilot",type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
