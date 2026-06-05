"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/supabase"
export default function Productos(){

const [productos,setProductos]=useState([])
const [nombre,setNombre]=useState("")
const [precio,setPrecio]=useState("")

useEffect(()=>{

cargarProductos()

},[])

async function cargarProductos(){

const { data, error } = await supabase
.from("productos")
.select("*")
.order("id")

if(error){
console.log(error)
return
}

setProductos(data || [])

}

async function agregarProducto(){

if(nombre === "" || precio === ""){
alert("Ingrese nombre y precio")
return
}

const { error } = await supabase
.from("productos")
.insert([
{
nombre:nombre,
precio:Number(precio)
}
])

if(error){
alert(error.message)
return
}

cargarProductos()

setNombre("")
setPrecio("")

}

async function eliminarProducto(id:any){

const { error } = await supabase
.from("productos")
.delete()
.eq("id", id)

if(error){
alert(error.message)
return
}

cargarProductos()

}


return(

<div style={contenedor}>

<h1 style={titulo}>📦 Productos que ofrece la empresa</h1>

<div style={formulario}>

<input
style={input}
placeholder="Nombre del producto"
value={nombre}
onChange={e=>setNombre(e.target.value)}
/>

<input
style={input}
type="number"
placeholder="Precio base"
value={precio}
onChange={e=>setPrecio(Number(e.target.value))}
/>

<button
style={botonAgregar}
onClick={agregarProducto}
>
Agregar producto
</button>

</div>

<div style={lista}>

{productos.map((p,i)=>(

<div key={i} style={productoCard}>

<div>
<b>{p.nombre}</b>
<br/>
Precio base: <b>${p.precio}</b>
</div>

<button
style={botonEliminar}
onClick={()=>eliminarProducto(p.id)}
>
Eliminar
</button>

</div>

))}

</div>

</div>

)

}

const contenedor={
background:"#f8fafc",
minHeight:"100vh",
padding:"40px",
color:"#000"
}

const titulo={
fontSize:"30px",
marginBottom:"30px"
}

const formulario={
display:"flex",
gap:"10px",
marginBottom:"30px"
}

const input={
padding:"10px",
borderRadius:"6px",
border:"1px solid #ccc",
width:"200px"
}

const botonAgregar={
background:"#16a34a",
color:"#fff",
border:"none",
padding:"10px 15px",
borderRadius:"6px",
cursor:"pointer"
}

const lista={
display:"flex",
flexDirection:"column",
gap:"10px",
maxWidth:"500px"
}

const productoCard={
background:"#ffffff",
padding:"15px",
borderRadius:"8px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}

const botonEliminar={
background:"#ef4444",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:"6px",
cursor:"pointer"
}