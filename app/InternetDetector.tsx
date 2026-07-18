"use client";

import { useEffect, useState } from "react";

export default function InternetDetector() {

  const [online, setOnline] = useState(true);

  useEffect(() => {

    setOnline(navigator.onLine);

    const conectar = () => setOnline(true);
    const desconectar = () => setOnline(false);

    window.addEventListener("online", conectar);
    window.addEventListener("offline", desconectar);

    return () => {
      window.removeEventListener("online", conectar);
      window.removeEventListener("offline", desconectar);
    };

  }, []);

  if (online) return null;

 return (

  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999999
    }}
  >

    <div
      style={{
        background: "#ffffff",
        padding: "40px",
        borderRadius: "15px",
        textAlign: "center",
        minWidth: "350px",
        boxShadow: "0 0 25px rgba(0,0,0,0.4)"
      }}
    >

      <h1 style={{color:"#dc2626",marginBottom:"20px"}}>
        📡 Sin conexión a Internet
      </h1>

      <p style={{fontSize:"18px",marginBottom:"15px"}}>
        Revise su conexión para continuar.
      </p>

      <p style={{color:"#2563eb",fontWeight:"bold"}}>
        ⏳ Esperando conexión...
      </p>

    </div>

  </div>

);

}