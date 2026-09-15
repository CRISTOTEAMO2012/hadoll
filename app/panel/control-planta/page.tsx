"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/supabase"

export default function ControlPlanta() {

const [pestana,setPestana]=useState("equipos")
const [equipos,setEquipos]=useState<any[]>([])
const [equipoSeleccionado,setEquipoSeleccionado]=useState<any>(null)
const [mostrarFicha,setMostrarFicha]=useState(false)
const [observaciones,setObservaciones]=useState("")
const [estado,setEstado]=useState("")
const [horasTrabajadas,setHorasTrabajadas]=useState("")
const [ultimoMantenimiento,setUltimoMantenimiento]=useState("")
const [proximoMantenimiento,setProximoMantenimiento]=useState("")
const [ph,setPh]=useState("")
const [tds,setTds]=useState("")
const [conductividad,setConductividad]=useState("")
const [temperatura,setTemperatura]=useState("")
const [cloro,setCloro]=useState("")
const [observacionMedicion,setObservacionMedicion]=useState("")
const [diagnostico,setDiagnostico]=useState("")
const [respuestaDiagnostico,setRespuestaDiagnostico]=useState("")
const [manual,setManual]=useState("")
useEffect(()=>{

cargarEquipos()

},[])
async function guardarCambios(){

if(!equipoSeleccionado) return

const { error } = await supabase
.from("equipos_planta")
.update({

estado,
horas_trabajadas: horasTrabajadas,
ultimo_mantenimiento: ultimoMantenimiento,
proximo_mantenimiento: proximoMantenimiento,
observaciones

})
.eq("id",equipoSeleccionado.id)

if(error){

alert("Error al guardar")
console.log(error)
return

}

alert("✅ Cambios guardados")

setMostrarFicha(false)

cargarEquipos()

}

async function guardarMedicion(){

let estado="EXCELENTE"

if(Number(ph)<6.5 || Number(ph)>8.5){
estado="REVISAR"
}

if(Number(tds)>30){
estado="REVISAR"
}

if(Number(conductividad)>50){
estado="REVISAR"
}

if(
Number(temperatura)<18 ||
Number(temperatura)>30
){
estado="REVISAR"
}

await supabase
.from("mediciones_planta")
.insert([{

fecha:new Date().toISOString().substring(0,10),

hora:new Date().toLocaleTimeString(),

ph,

tds,

conductividad,

temperatura,

cloro,

observaciones:observacionMedicion,

operador:"Miguel",

estado

}])

if(estado==="EXCELENTE"){

alert(
"✅ Agua dentro de parámetros.\n\nLa producción puede continuar normalmente."
)

}else{

alert(
"⚠ Hay parámetros fuera del rango.\n\nRevise el módulo Diagnóstico antes de continuar produciendo."
)

}

setPh("")
setTds("")
setConductividad("")
setTemperatura("")
setCloro("")
setObservacionMedicion("")

}

async function cargarEquipos(){

const { data, error } = await supabase
.from("equipos_planta")
.select("*")
.order("id")

if(error){

console.log(error)
return

}

setEquipos(data || [])
console.log("ERROR:", error)
console.log("DATOS:", data)
}
return(

<div style={contenedor}>

<h1 style={titulo}>
🏭 CENTRO DE CONTROL DE PLANTA
</h1>

<div style={tabs}>

<button
style={pestana==="equipos"?tabActivo:tab}
onClick={()=>setPestana("equipos")}
>
🔧 Equipos
</button>

<button
style={pestana==="mediciones"?tabActivo:tab}
onClick={()=>setPestana("mediciones")}
>
📊 Mediciones
</button>

<button
style={pestana==="mantenimiento"?tabActivo:tab}
onClick={()=>setPestana("mantenimiento")}
>
🛠 Mantenimiento
</button>

<button
style={pestana==="diagnostico"?tabActivo:tab}
onClick={()=>setPestana("diagnostico")}
>
🧪 Diagnóstico
</button>

<button
style={pestana==="biblioteca"?tabActivo:tab}
onClick={()=>setPestana("biblioteca")}
>
📚 Biblioteca
</button>

</div>

<div style={panel}>

{pestana==="equipos" && (

<div>

<h2 style={{marginBottom:"20px"}}>
🔧 EQUIPOS DE LA PLANTA
</h2>

{equipos.map((e:any)=>(

<div
key={e.id}
style={{
border:"1px solid #ddd",
borderRadius:"12px",
padding:"15px",
marginBottom:"12px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>

<h3 style={{margin:0}}>
{e.nombre}
</h3>

<p style={{margin:"5px 0"}}>
Tipo: {e.tipo}
</p>

<p style={{margin:0}}>
Estado:

<b
style={{
color:
e.estado==="OPERATIVO"
? "#16a34a"
: e.estado==="MANTENIMIENTO"
? "#ca8a04"
: "#dc2626"
}}
>
 {e.estado}
</b>

</p>

</div>

<button
onClick={()=>{

setEquipoSeleccionado(e)

setEstado(e.estado ?? "BUENO")
setHorasTrabajadas(e.horas_trabajadas ?? 0)
setUltimoMantenimiento(e.ultimo_mantenimiento ?? "")
setProximoMantenimiento(e.proximo_mantenimiento ?? "")
setObservaciones(e.observaciones ?? "")

setMostrarFicha(true)

}}
style={{
background:"#2563eb",
color:"#fff",
border:"none",
padding:"10px 15px",
borderRadius:"8px",
cursor:"pointer"
}}
>
🔧 Administrar Equipo
</button>

</div>

))}

</div>

)}

{pestana==="mediciones" && (

<div>

<h2>📊 MEDICIONES DIARIAS</h2>

<div
style={{
background:"#ecfeff",
border:"2px solid #0891b2",
padding:"15px",
borderRadius:"10px",
marginBottom:"20px"
}}
>

<h3>📋 Valores de referencia</h3>

<p>✅ pH: <b>6.5 - 8.5</b></p>

<p>✅ TDS Agua Purificada: <b>0 - 30 ppm</b></p>

<p>✅ Conductividad: <b>0 - 50 µS/cm</b></p>

<p>✅ Temperatura recomendada: <b>18 - 30 °C</b></p>

<p>✅ Cloro residual (agua de ingreso): <b>0.2 - 1 ppm</b></p>

</div>

<input
style={input}
placeholder="PH"
value={ph}
onChange={(e)=>setPh(e.target.value)}
/>

<input
style={input}
placeholder="TDS"
value={tds}
onChange={(e)=>setTds(e.target.value)}
/>

<input
style={input}
placeholder="Conductividad"
value={conductividad}
onChange={(e)=>setConductividad(e.target.value)}
/>

<input
style={input}
placeholder="Temperatura"
value={temperatura}
onChange={(e)=>setTemperatura(e.target.value)}
/>

<input
style={input}
placeholder="Cloro"
value={cloro}
onChange={(e)=>setCloro(e.target.value)}
/>

<textarea

style={{

...input,

height:"120px"

}}

placeholder="Observaciones"

value={observacionMedicion}

onChange={(e)=>setObservacionMedicion(e.target.value)}

/>

<button

style={botonVerde}

onClick={guardarMedicion}

>

💾 Guardar Medición

</button>

</div>

)}

{pestana==="mantenimiento" && (

<div>

<h2>🛠 MANTENIMIENTO PREVENTIVO</h2>

<p
style={{
marginTop:"15px",
fontSize:"17px",
fontWeight:"bold"
}}
>
Seleccione un equipo para registrar mantenimiento.
</p>

{equipos.map((e:any)=>(

<div
key={e.id}
style={{
border:
e.proximo_mantenimiento &&
new Date(e.proximo_mantenimiento) < new Date()
? "2px solid #dc2626"
: "1px solid #ddd",

background:
e.proximo_mantenimiento &&
new Date(e.proximo_mantenimiento) < new Date()
? "#fef2f2"
: "#fff",
borderRadius:"10px",
padding:"15px",
marginTop:"15px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div>

<h3 style={{margin:0}}>
{e.nombre}
</h3>

<p style={{margin:"8px 0"}}>
Último mantenimiento:
<b> {e.ultimo_mantenimiento || "No registrado"}</b>
</p>

<p style={{margin:0}}>
Próximo mantenimiento:
<b> {e.proximo_mantenimiento || "No registrado"}</b>
</p>

</div>

<button
style={botonVerde}
onClick={()=>{

setEquipoSeleccionado(e)

setEstado(e.estado ?? "BUENO")

setHorasTrabajadas(e.horas_trabajadas ?? "")

setUltimoMantenimiento(e.ultimo_mantenimiento ?? "")

setProximoMantenimiento(e.proximo_mantenimiento ?? "")

setObservaciones(e.observaciones ?? "")

setMostrarFicha(true)

}}
>

🛠 Abrir Ficha

</button>

</div>

))}

</div>

)}

{pestana==="diagnostico" && (

<div>

<h2>🧪 CENTRO DE DIAGNÓSTICO</h2>

<p style={{fontWeight:"bold"}}>

Seleccione el problema detectado.

</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"12px",
marginTop:"20px"
}}
>

<button
style={botonAzul}
onClick={()=>setDiagnostico("sabor")}
>
💧 Agua con mal sabor
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("olor")}
>
🦠 Agua con mal olor
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("turbia")}
>
☁ Agua turbia
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("tds")}
>
📈 TDS alto
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("ph")}
>
⚠ pH fuera de rango
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("produccion")}
>
🚰 Baja producción
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("presion")}
>
💨 Baja presión
</button>

<button
style={botonAzul}
onClick={()=>setDiagnostico("otra")}
>
🔴 Otra falla
</button>

{diagnostico==="sabor" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #2563eb"
}}
>

<h3>💧 Diagnóstico: Agua con mal sabor</h3>

<p><b>Paso 1:</b> Mida el TDS del agua purificada.</p>

<p>Valor correcto: <b>0 - 30 ppm.</b></p>

<p><b>Paso 2:</b> Si el TDS es mayor de 30 ppm, NO continúe produciendo.</p>

<p><b>Paso 3:</b> Revise el estado de las membranas de ósmosis inversa.</p>

<p><b>Paso 4:</b> Verifique que el filtro de carbón activado esté funcionando correctamente.</p>

<p><b>Paso 5:</b> Si todo está correcto, continúe con el siguiente diagnóstico.</p>

<hr/>

<h3>Ingrese el resultado obtenido</h3>

<input
style={input}
placeholder="Ejemplo: El TDS fue 52 ppm"
value={respuestaDiagnostico}
onChange={(e)=>setRespuestaDiagnostico(e.target.value)}
/>

<button
style={botonVerde}
onClick={()=>{

if(respuestaDiagnostico===""){
alert("Ingrese primero el resultado obtenido")
return
}

alert(
"Resultado registrado.\n\nEn la siguiente versión el sistema continuará automáticamente con el siguiente paso del diagnóstico."
)

}}
>

Continuar Diagnóstico

</button>

</div>

)}

{diagnostico==="tds" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #16a34a"
}}
>

<h3>📈 Diagnóstico: TDS Alto</h3>

<p><b>Paso 1:</b> Mida el TDS.</p>

<p><b>Valor normal:</b> 0 - 30 ppm.</p>

<input
style={input}
placeholder="Ingrese el TDS medido"
value={respuestaDiagnostico}
onChange={(e)=>setRespuestaDiagnostico(e.target.value)}
/>

<button
style={botonVerde}
onClick={()=>{

const valor=Number(respuestaDiagnostico)

if(valor<=30){

alert(
"✅ Agua correcta.\n\nLas membranas trabajan normalmente."
)

}else if(valor<=60){

alert(
"⚠ Membranas comenzando a desgastarse.\n\nPlanifique mantenimiento."
)

}else{

alert(
"🚨 TDS MUY ALTO.\n\nCambie las membranas de Ósmosis Inversa."
)

}

}}
>

Analizar TDS

</button>

</div>

)}

{diagnostico==="ph" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #f59e0b"
}}
>

<h3>⚠ Diagnóstico: pH fuera de rango</h3>

<p><b>Rango correcto:</b> 6.5 a 8.5</p>

<input
style={input}
placeholder="Ingrese el pH medido"
value={respuestaDiagnostico}
onChange={(e)=>setRespuestaDiagnostico(e.target.value)}
/>

<button
style={botonVerde}
onClick={()=>{

let valor=Number(respuestaDiagnostico)

if(valor>=6.5 && valor<=8.5){

alert("✅ El pH es correcto.")

}else{

alert("🚨 pH fuera de rango.\nRevise el sistema de dosificación y la calidad del agua de ingreso.")

}

}}
>

Analizar

</button>

</div>

)}
</div>

</div>

)}

{diagnostico==="produccion" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #2563eb"
}}
>

<h3>🚰 Diagnóstico: Baja Producción</h3>

<p><b>Posibles causas:</b></p>

<p>• Filtros saturados.</p>

<p>• Baja presión de alimentación.</p>

<p>• Membranas obstruidas.</p>

<p>• Bomba de alta presión con desgaste.</p>

<p>• Válvulas parcialmente cerradas.</p>

<p>• Fuga de agua.</p>

<button
style={botonVerde}
onClick={()=>{

alert(
"Revise primero los filtros.\n\nLuego mida la presión.\n\nFinalmente inspeccione la bomba y las membranas."
)

}}
>

Mostrar Procedimiento

</button>

</div>

)}

{diagnostico==="presion" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #0ea5e9"
}}
>

<h3>💨 Diagnóstico: Baja Presión</h3>

<p><b>Revise lo siguiente:</b></p>

<p>1. Nivel de agua del tanque.</p>

<p>2. Filtro de sedimentos obstruido.</p>

<p>3. Filtro de carbón saturado.</p>

<p>4. Bomba de alimentación.</p>

<p>5. Posibles fugas de agua.</p>

<p>6. Aire dentro del sistema.</p>

<button
style={botonVerde}
onClick={()=>{

alert(
"Procedimiento recomendado:\n\n1. Revise el nivel del tanque.\n2. Revise filtros.\n3. Revise bomba.\n4. Revise fugas.\n5. Purge el sistema si existe aire."
)

}}
>

Mostrar Procedimiento

</button>

</div>

)}

{diagnostico==="turbia" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #3b82f6"
}}
>

<h3>☁ Diagnóstico: Agua Turbia</h3>

<p><b>Posibles causas:</b></p>

<p>• Filtro de sedimentos saturado.</p>

<p>• Filtro roto.</p>

<p>• Tanque de almacenamiento sucio.</p>

<p>• Agua de ingreso con alta turbidez.</p>

<p>• Lavado insuficiente de filtros.</p>

<p>• Membranas dañadas.</p>

<button
style={botonVerde}
onClick={()=>{

alert(
"Procedimiento recomendado:\n\n1. Revise el filtro de sedimentos.\n2. Revise el filtro multimedia.\n3. Revise el tanque.\n4. Realice retrolavado.\n5. Si continúa, revise membranas."
)

}}
>

Mostrar Procedimiento

</button>

</div>

)}

{diagnostico==="olor" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #8b5cf6"
}}
>

<h3>🦠 Diagnóstico: Agua con mal olor</h3>

<p><b>Posibles causas:</b></p>

<p>• Filtro de carbón activado agotado.</p>

<p>• Tanque de almacenamiento contaminado.</p>

<p>• Presencia de bacterias.</p>

<p>• Agua de ingreso con mal olor.</p>

<p>• Falta de limpieza del sistema.</p>

<button
style={botonVerde}
onClick={()=>{

alert(
"Procedimiento recomendado:\n\n1. Revise el filtro de carbón activado.\n2. Desinfecte el tanque.\n3. Revise el agua de ingreso.\n4. Realice sanitización completa de la planta."
)

}}
>

Mostrar Procedimiento

</button>

</div>

)}

{diagnostico==="otra" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #dc2626"
}}
>

<h3>🔴 Otra Falla</h3>

<p><b>Describa brevemente el problema encontrado:</b></p>

<textarea
style={{
...input,
height:"120px"
}}
placeholder="Ejemplo: La bomba hace mucho ruido..."
value={respuestaDiagnostico}
onChange={(e)=>setRespuestaDiagnostico(e.target.value)}
/>

<button
style={botonVerde}
onClick={()=>{

if(respuestaDiagnostico===""){

alert("Describa primero la falla.")

return

}

alert(
"✅ Falla registrada.\n\nRecomendación:\nComunicar al responsable de mantenimiento y registrar el evento."
)

}}
>

Registrar Falla

</button>

</div>

)}

{pestana==="biblioteca" && (

<div>

<h2>📚 BIBLIOTECA TÉCNICA</h2>

<p style={{marginBottom:"20px"}}>

Seleccione el manual que desea consultar.

</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"15px"
}}
>

<button
style={botonAzul}
onClick={()=>setManual("osmosis")}
>
💧 Ósmosis Inversa
</button>

<button style={botonAzul} onClick={()=>setManual("multimedia")}>
🧱 Filtro Multimedia
</button>

<button style={botonAzul} onClick={()=>setManual("carbon")}>
⚫ Carbón Activado
</button>

<button style={botonAzul} onClick={()=>setManual("uv")}>
💡 Lámpara Ultravioleta
</button>

<button style={botonAzul} onClick={()=>setManual("ozono")}>
🫧 Generador de Ozono
</button>

<button style={botonAzul} onClick={()=>setManual("bombas")}>
⚙ Bombas
</button>

<button style={botonAzul} onClick={()=>setManual("mantenimiento")}>
🛠 Mantenimiento Preventivo
</button>

<button style={botonAzul} onClick={()=>setManual("sanitizacion")}>
🧴 Sanitización
</button>

<button style={botonAzul} onClick={()=>setManual("parametros")}>
📋 Parámetros del Agua
</button>

<button style={botonAzul} onClick={()=>setManual("fallas")}>
🚨 Solución de Fallas
</button>

{manual==="osmosis" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #2563eb"
}}
>

<h3>💧 ÓSMOSIS INVERSA</h3>

<p><b>¿Qué hace?</b></p>

<p>
La ósmosis inversa elimina sales, minerales, bacterias, virus y otras impurezas del agua utilizando una membrana especial.
</p>

<p><b>Vida útil de la membrana:</b></p>

<p>
Entre 2 y 5 años dependiendo de la calidad del agua y del mantenimiento.
</p>

<p><b>Señales de daño:</b></p>

<p>• TDS elevado.</p>

<p>• Baja producción.</p>

<p>• Mala calidad del agua.</p>

<p>• Presión anormal.</p>

</div>

)}

{manual==="multimedia" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #16a34a"
}}
>

<h3>🧱 FILTRO MULTIMEDIA</h3>

<p><b>Función:</b></p>

<p>
Retiene arena, lodo, barro y partículas grandes antes de que lleguen a los demás filtros.
</p>

<p><b>Mantenimiento:</b></p>

<p>• Realizar retrolavado periódicamente.</p>

<p>• Revisar pérdida de presión.</p>

<p>• Cambiar el material filtrante cuando sea necesario.</p>

</div>

)}

{manual==="carbon" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #374151"
}}
>

<h3>⚫ FILTRO DE CARBÓN ACTIVADO</h3>

<p><b>Función:</b></p>

<p>
Elimina cloro, olores, sabores desagradables y sustancias orgánicas del agua.
</p>

<p><b>Vida útil aproximada:</b></p>

<p>
Entre 6 meses y 12 meses dependiendo de la cantidad de agua tratada.
</p>

<p><b>Señales de desgaste:</b></p>

<p>• Agua con mal olor.</p>

<p>• Agua con mal sabor.</p>

<p>• Presencia de cloro después del filtro.</p>

<p>• Disminución de la calidad del agua.</p>

</div>

)}

{manual==="uv" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #eab308"
}}
>

<h3>💡 LÁMPARA ULTRAVIOLETA</h3>

<p><b>Función:</b></p>

<p>
Desinfecta el agua eliminando bacterias, virus y otros microorganismos mediante radiación ultravioleta.
</p>

<p><b>Vida útil:</b></p>

<p>
Aproximadamente 9.000 horas de funcionamiento o 1 año de uso continuo.
</p>

<p><b>Mantenimiento:</b></p>

<p>• Limpiar periódicamente el tubo de cuarzo.</p>

<p>• Cambiar la lámpara cuando complete su vida útil.</p>

<p>• Verificar que siempre permanezca encendida.</p>

<p><b>Señales de falla:</b></p>

<p>• La lámpara no enciende.</p>

<p>• El agua puede perder su desinfección.</p>

<p>• Indicador luminoso apagado.</p>

</div>

)}

{manual==="ozono" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #06b6d4"
}}
>

<h3>🫧 GENERADOR DE OZONO</h3>

<p><b>Función:</b></p>

<p>
El ozono elimina bacterias, virus, hongos y malos olores. Además mejora la conservación del agua embotellada.
</p>

<p><b>Mantenimiento:</b></p>

<p>• Mantener limpio el equipo.</p>

<p>• Revisar conexiones eléctricas.</p>

<p>• Revisar el flujo de aire.</p>

<p>• Verificar que produzca ozono correctamente.</p>

<p><b>Señales de falla:</b></p>

<p>• El agua pierde tiempo de conservación.</p>

<p>• No se percibe producción de ozono.</p>

<p>• Alarmas del equipo.</p>

<p>• Ruido anormal.</p>

</div>

)}

{manual==="bombas" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #0f766e"
}}
>

<h3>⚙ BOMBAS</h3>

<p><b>Función:</b></p>

<p>
Las bombas impulsan el agua durante todo el proceso de purificación. Sin ellas la planta no puede producir agua.
</p>

<p><b>Revisar periódicamente:</b></p>

<p>• Fugas de agua.</p>

<p>• Ruidos extraños.</p>

<p>• Vibraciones excesivas.</p>

<p>• Temperatura del motor.</p>

<p>• Presión de trabajo.</p>

<p><b>Mantenimiento:</b></p>

<p>• Lubricación cuando corresponda.</p>

<p>• Ajuste de pernos.</p>

<p>• Cambio de sellos cuando existan fugas.</p>

<p>• Limpieza general.</p>

</div>

)}

{manual==="mantenimiento" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #ca8a04"
}}
>

<h3>🛠 MANTENIMIENTO PREVENTIVO</h3>

<p><b>Objetivo:</b></p>

<p>
Evitar daños en los equipos antes de que ocurran fallas, aumentando su vida útil y reduciendo costos de reparación.
</p>

<p><b>Actividades recomendadas:</b></p>

<p>• Inspección visual diaria.</p>

<p>• Limpieza de equipos.</p>

<p>• Revisión de fugas.</p>

<p>• Revisión de presión.</p>

<p>• Cambio oportuno de filtros.</p>

<p>• Lubricación cuando corresponda.</p>

<p>• Registro de horas trabajadas.</p>

<p>• Registro de cada mantenimiento realizado.</p>

</div>

)}

{manual==="sanitizacion" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #10b981"
}}
>

<h3>🧴 SANITIZACIÓN DE LA PLANTA</h3>

<p><b>Objetivo:</b></p>

<p>
Eliminar bacterias, hongos, virus y cualquier contaminación dentro del sistema de purificación.
</p>

<p><b>Frecuencia recomendada:</b></p>

<p>• Cada 30 días.</p>

<p>• Después de cambiar membranas.</p>

<p>• Después de cambiar filtros.</p>

<p>• Cuando exista contaminación del agua.</p>

<p><b>Procedimiento general:</b></p>

<p>• Detener la producción.</p>

<p>• Preparar la solución sanitizante.</p>

<p>• Hacer circular la solución por todo el sistema.</p>

<p>• Esperar el tiempo recomendado.</p>

<p>• Enjuagar completamente con agua limpia.</p>

<p>• Verificar nuevamente el TDS y el pH antes de producir.</p>

</div>

)}

{manual==="parametros" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #2563eb"
}}
>

<h3>📋 PARÁMETROS DEL AGUA</h3>

<p><b>Valores recomendados:</b></p>

<p>✅ pH: 6.5 - 8.5</p>

<p>✅ TDS: 0 - 30 ppm</p>

<p>✅ Conductividad: 0 - 50 µS/cm</p>

<p>✅ Temperatura: 18 - 30 °C</p>

<p>✅ Cloro residual (agua de ingreso): 0.2 - 1 ppm</p>

<p><b>Si algún parámetro está fuera del rango:</b></p>

<p>• Detener la producción.</p>

<p>• Revisar el módulo Diagnóstico.</p>

<p>• Corregir la falla antes de continuar.</p>

<p>• Registrar la novedad en el sistema.</p>

</div>

)}

{manual==="fallas" && (

<div
style={{
marginTop:"25px",
background:"#f8fafc",
padding:"20px",
borderRadius:"10px",
border:"2px solid #dc2626"
}}
>

<h3>🚨 SOLUCIÓN RÁPIDA DE FALLAS</h3>

<p><b>Problema:</b> TDS alto.</p>
<p><b>Solución:</b> Revisar membranas de ósmosis y filtros.</p>

<hr/>

<p><b>Problema:</b> Agua con mal olor.</p>
<p><b>Solución:</b> Revisar carbón activado y sanitizar el sistema.</p>

<hr/>

<p><b>Problema:</b> Agua turbia.</p>
<p><b>Solución:</b> Revisar filtro multimedia, sedimentos y tanque.</p>

<hr/>

<p><b>Problema:</b> Baja producción.</p>
<p><b>Solución:</b> Revisar presión, bomba, membranas y filtros.</p>

<hr/>

<p><b>Problema:</b> Baja presión.</p>
<p><b>Solución:</b> Revisar bomba, nivel del tanque, fugas y filtros.</p>

<hr/>

<p><b>Problema:</b> pH fuera de rango.</p>
<p><b>Solución:</b> Revisar calidad del agua de ingreso y sistema de dosificación.</p>

<hr/>

<p><b>Problema:</b> Lámpara UV apagada.</p>
<p><b>Solución:</b> Revisar alimentación eléctrica y reemplazar la lámpara si terminó su vida útil.</p>

</div>

)}

</div>

</div>

)}

{mostrarFicha && equipoSeleccionado && (

<div
style={{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
}}
>

<div
style={{
background:"#fff",
width:"700px",
padding:"30px",
borderRadius:"15px",
maxHeight:"90vh",
overflow:"auto"
}}
>

<h2>
🔧 {equipoSeleccionado.nombre}
</h2>

<hr/>

<p><b>Tipo:</b> {equipoSeleccionado.tipo}</p>

<p><b>Estado</b></p>

<select
value={estado}
onChange={(e)=>setEstado(e.target.value)}
style={{width:"100%",padding:"10px",marginBottom:"12px"}}
>
<option>BUENO</option>
<option>MANTENIMIENTO</option>
<option>DAÑADO</option>
</select>

<p><b>Horas trabajadas</b></p>

<input
type="number"
value={horasTrabajadas}
onChange={(e)=>setHorasTrabajadas(e.target.value)}
style={{width:"100%",padding:"10px",marginBottom:"12px"}}
/>

<p><b>Último mantenimiento</b></p>

<input
type="date"
value={ultimoMantenimiento}
onChange={(e)=>setUltimoMantenimiento(e.target.value)}
style={{width:"100%",padding:"10px",marginBottom:"12px"}}
/>

<p><b>Próximo mantenimiento</b></p>

<input
type="date"
value={proximoMantenimiento}
onChange={(e)=>setProximoMantenimiento(e.target.value)}
style={{width:"100%",padding:"10px",marginBottom:"12px"}}
/>

<p><b>Observaciones:</b></p>

<textarea
style={{
width:"100%",
height:"120px",
padding:"10px",
borderRadius:"8px",
border:"1px solid #999",
fontSize:"16px"
}}
value={observaciones}
onChange={(e)=>{
console.log("Escribiendo:",e.target.value)
setObservaciones(e.target.value)
}}
/>

<br/><br/>

<div
style={{
display:"flex",
justifyContent:"space-between",
marginTop:"20px"
}}
>

<button
onClick={guardarCambios}
style={{
background:"#16a34a",
color:"#fff",
padding:"12px 18px",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}}
>
💾 Guardar Cambios
</button>

<button
onClick={()=>setMostrarFicha(false)}
style={{
background:"#dc2626",
color:"#fff",
padding:"12px 18px",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}}
>
Cerrar
</button>

</div>

</div>

</div>

)}

</div>

</div>

)

}

const contenedor={
padding:"30px",
background:"#f1f5f9",
minHeight:"100vh",
color:"#000"
}

const titulo={
fontSize:"32px",
fontWeight:"bold",
marginBottom:"25px"
}

const tabs={
display:"flex",
gap:"10px",
flexWrap:"wrap" as const,
marginBottom:"25px"
}

const tab={
padding:"12px 20px",
border:"none",
borderRadius:"10px",
background:"#e5e7eb",
cursor:"pointer",
fontWeight:"bold"
}

const tabActivo={
...tab,
background:"#2563eb",
color:"#fff"
}

const panel={
background:"#fff",
padding:"25px",
borderRadius:"15px",
boxShadow:"0 4px 10px rgba(0,0,0,0.08)"
}
const input={

padding:"12px",

border:"2px solid #2563eb",

borderRadius:"8px",

background:"#eff6ff",

color:"#000",

fontWeight:"bold",

fontSize:"15px",

marginBottom:"10px",

width:"100%"

}
const botonVerde={

background:"#16a34a",

color:"#fff",

padding:"12px",

border:"none",

borderRadius:"10px",

cursor:"pointer",

fontWeight:"bold",

fontSize:"17px"

}
const botonAzul={

background:"#2563eb",

color:"#fff",

padding:"15px",

border:"none",

borderRadius:"10px",

cursor:"pointer",

fontWeight:"bold",

fontSize:"16px"

}