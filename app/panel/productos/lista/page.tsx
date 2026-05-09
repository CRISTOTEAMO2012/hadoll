"use client"
import {useEffect,useState} from "react"

export default function Inventario(){

const [inventario,setInventario]=useState([])

useEffect(()=>{

let productos=JSON.parse(localStorage.getItem("productos")||"[]")

let conteo={}

productos.forEach(p=>{

if(conteo[p.tipo]){
conteo[p.tipo]++
}else{
conteo[p.tipo]=1
}

})

let lista=Object.keys(conteo).map(tipo=>({
tipo:tipo,
total:conteo[tipo]
}))

setInventario(lista)

},[])

return(

<div style={{
background:"#ffffff",
minHeight:"100vh",
padding:"40px"
}}>

<h1 style={{
color:"#000000",
marginBottom:"30px"
}}>
INVENTARIO DE PRODUCTOS
</h1>

<table style={{
width:"100%",
borderCollapse:"collapse"
}}>

<thead>

<tr style={{background:"#f2f2f2"}}>

<th style={{
color:"#000000",
padding:"15px",
border:"1px solid #ccc",
fontSize:"18px"
}}>
TIPO DE PRODUCTO
</th>

<th style={{
color:"#000000",
padding:"15px",
border:"1px solid #ccc",
fontSize:"18px"
}}>
TOTAL
</th>

</tr>

</thead>

<tbody>

{inventario.map((p,i)=>(

<tr key={i}>

<td style={{
color:"#000000",
padding:"15px",
border:"1px solid #ccc",
fontSize:"18px"
}}>
{p.tipo}
</td>

<td style={{
color:"#000000",
padding:"15px",
border:"1px solid #ccc",
fontSize:"18px",
fontWeight:"bold"
}}>
{p.total}
</td>

</tr>

))}

</tbody>

</table>

</div>

)

}