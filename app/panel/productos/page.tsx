"use client"

import { useState, useEffect } from "react"

export default function Productos(){

const [productos,setProductos]=useState([])
const [nombre,setNombre]=useState("")
const [precio,setPrecio]=useState("")

useEffect(()=>{

let data = JSON.parse(localStorage.getItem("productos") || "[]")

if(data.length === 0){

data = [
{nombre:"Botellón 20L con llave", precio:2.5},
{nombre:"Botellón 20L sin llave", precio:2},
{nombre:"Paca 15 botellas 600 ml", precio:3.5},
{nombre:"Paca 24 botellas 600 ml", precio:5},
{nombre:"Botella 6000 ml", precio:1.5},
{nombre:"Botella 1L", precio:1} // ✅ NUEVO PRODUCTO
]

localStorage.setItem("productos", JSON.stringify(data))

}

setProductos(data)

},[])

function agregarProducto(){

if(nombre === "" || precio === ""){
alert("Ingrese nombre y precio")
return
}

let data = [...productos]

data.push({
nombre:nombre,
precio:Number(precio)
})

localStorage.setItem("productos", JSON.stringify(data))

setProductos(data)

setNombre("")
setPrecio("")

}

function eliminarProducto(index:any){

let data=[...productos]

data.splice(index,1)

localStorage.setItem("productos", JSON.stringify(data))

setProductos(data)

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
onClick={()=>eliminarProducto(i)}
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