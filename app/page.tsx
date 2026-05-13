"use client";
import { useState } from "react";

export default function Home() {

const [usuario, setUsuario] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const iniciarSesion = () => {

if (usuario === "admin" && password === "1234") {

localStorage.setItem("login","ok")

window.location.href = "/panel";

} else {

setError("Usuario o contraseña incorrectos");

}

};

return (

<div style={contenedorPrincipal}>

{/* 🌊 MARCA DE AGUA */}
<div style={marcaAgua}>
<img src="/logo.png" style={logoMarca}/>
</div>

<div style={cajaLogin}>

<img
src="/logo.png"
style={logo}
/>

<h1 style={titulo}>
💧 AGUA HADOLL
</h1>

<p style={subtitulo}>
Sistema Administrativo
</p>

<label style={label}>Usuario</label>

<input
type="text"
placeholder="Ingrese usuario"
value={usuario}
onChange={(e) => setUsuario(e.target.value)}
style={input}
/>

<label style={label}>Contraseña</label>

<input
type="password"
placeholder="Ingrese contraseña"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={input}
/>

{error && (
<p style={errorTexto}>
{error}
</p>
)}

<button
onClick={iniciarSesion}
style={boton}
>
🔐 Iniciar Sesión
</button>

</div>

</div>

);

}

/* 🌈 FONDO */
const contenedorPrincipal={

display:"flex",
justifyContent:"center",
alignItems:"center",

height:"100vh",

background:
"linear-gradient(135deg, #60a5fa 0%, #818cf8 45%, #c084fc 100%)",

fontFamily:"Segoe UI, Tahoma, Geneva, Verdana, sans-serif",

position:"relative",
overflow:"hidden"

}

/* 🌊 MARCA AGUA */
const marcaAgua={

position:"absolute",
top:"50%",
left:"50%",

transform:"translate(-50%,-50%)",

opacity:"0.08",
pointerEvents:"none"

}

const logoMarca={

width:"700px",
height:"700px",
objectFit:"contain"

}

/* 📦 CAJA LOGIN */
const cajaLogin={

background:"rgba(255,255,255,0.15)",

backdropFilter:"blur(12px)",

padding:"40px",

borderRadius:"25px",

width:"360px",

boxShadow:"0 10px 30px rgba(0,0,0,0.25)",

display:"flex",
flexDirection:"column",

position:"relative",
zIndex:"2",

border:"1px solid rgba(255,255,255,0.2)"

}

const logo={

width:"120px",
height:"120px",

objectFit:"contain",

margin:"0 auto 15px auto",

background:"#fff",

borderRadius:"50%",

padding:"10px",

boxShadow:"0 5px 15px rgba(0,0,0,0.25)"

}

const titulo={

textAlign:"center",

color:"#fff",

fontSize:"34px",

fontWeight:"800",

marginBottom:"5px",

textShadow:"0 3px 8px rgba(0,0,0,0.2)"

}

const subtitulo={

textAlign:"center",

color:"#e0f2fe",

marginBottom:"25px",

fontSize:"16px"

}

const label={

color:"#fff",

fontWeight:"bold",

marginBottom:"6px",

marginTop:"10px"

}

const input={

width:"100%",

padding:"13px",

borderRadius:"10px",

border:"none",

fontSize:"15px",

marginBottom:"10px",

outline:"none",

background:"rgba(255,255,255,0.9)",

color:"#000"

}

const boton={

width:"100%",

padding:"14px",

background:"#0ea5e9",

color:"#fff",

border:"none",

borderRadius:"12px",

fontSize:"17px",

cursor:"pointer",

fontWeight:"bold",

marginTop:"15px",

boxShadow:"0 5px 15px rgba(0,0,0,0.2)"

}

const errorTexto={

color:"#fee2e2",

background:"rgba(220,38,38,0.25)",

padding:"10px",

borderRadius:"10px",

fontSize:"14px",

marginTop:"10px",

textAlign:"center"

}