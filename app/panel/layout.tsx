"use client"

import { useRouter } from "next/navigation"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {

const router = useRouter()

return(
<>

<div
style={{
height:"90px",
width:"100%",
display:"flex",
alignItems:"center",
justifyContent:"center",
boxSizing:"border-box",
background:"linear-gradient(135deg,#60a5fa,#8b7cf6)"
}}
>

<div
onClick={()=>router.push("/panel")}
title="Ir al Panel Principal"
style={{
height:"58px",
padding:"0 18px 0 8px",
borderRadius:"30px",
background:"#123b6d",
display:"flex",
alignItems:"center",
justifyContent:"center",
gap:"10px",
cursor:"pointer",
zIndex:99999,
boxShadow:"0 4px 15px rgba(0,0,0,0.30)",
border:"3px solid #ffffff",
color:"#ffffff",
fontWeight:"bold",
fontSize:"14px"
}}
>

<img
src="/logo.png"
alt="Hadoll Water"
style={{
width:"44px",
height:"44px",
objectFit:"contain",
borderRadius:"50%"
}}
/>

<span>MENÚ PRINCIPAL</span>

</div>

</div>

{children}

</>
)

}