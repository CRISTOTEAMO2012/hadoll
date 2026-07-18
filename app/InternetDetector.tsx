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
        background: "#dc2626",
        color: "white",
        textAlign: "center",
        padding: "15px",
        fontWeight: "bold",
        fontSize: "18px",
        zIndex: 999999
      }}
    >
      📡 Sin conexión a Internet
    </div>

  );

}