"use client";
import { useState } from "react";

export default function Home() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const iniciarSesion = () => {
    if (usuario === "admin" && password === "1234") {
      window.location.href = "/panel";
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#eef2f7",
      fontFamily: "Arial"
    }}>
      
      <div style={{
        background: "#ffffff",
        padding: "40px",
        borderRadius: "12px",
        width: "320px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}>

        

        <label style={{color:"#333", fontWeight:"bold"}}>Usuario</label>

        <input
          type="text"
          placeholder="Ingrese usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "15px",
            color:"#000"
          }}
        />

        <label style={{color:"#333", fontWeight:"bold"}}>Contraseña</label>

        <input
          type="password"
          placeholder="Ingrese contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "15px",
            color:"#000"
          }}
        />

        {error && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {error}
          </p>
        )}
          <img src="/logo.jpg" style={{width:"100%", maxWidth:"320px", marginBottom:"20px"}} />
        <button
          onClick={iniciarSesion}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#0070f3",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight:"bold"
          }}
        >
          Iniciar Sesión
        </button>

      </div>
    </div>
  );
}