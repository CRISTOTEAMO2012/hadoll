
"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../supabase"

function fechaEcuador(){
  return new Date().toLocaleDateString("en-CA",{
    timeZone:"America/Guayaquil"
  })
}

async function leerTabla(tabla:string, desde:string, hasta:string){
  let registros:any[] = []
  let inicio = 0
  const bloque = 1000

  while(true){
    const {data,error} = await (supabase as any)
      .from(tabla)
      .select("*")
      .gte("fecha",desde)
      .lte("fecha",hasta)
      .order("id",{ascending:true})
      .range(inicio,inicio+bloque-1)

    if(error){
      console.error("Error leyendo "+tabla,error)
      return {data:registros,error:tabla+": "+error.message}
    }

    if(!data || data.length===0) break

    registros=[...registros,...data]

    if(data.length < bloque) break
    inicio += bloque
  }

  return {data:registros,error:""}
}


function Tabla({titulo,datos,columnas}:any){

  const [abierta,setAbierta]=useState(false)

    // ABRIR AUTOMÁTICAMENTE LAS TABLAS AL IMPRIMIR
  useEffect(()=>{

    function abrirTablas(){
      setAbierta(true)
    }

    window.addEventListener("beforeprint",abrirTablas)

    return ()=>{
      window.removeEventListener("beforeprint",abrirTablas)
    }

  },[])

  return(
    <div style={tablaCard}>

      <button
        onClick={()=>setAbierta(!abierta)}
        style={{
          width:"100%",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          background:"#fff",
          border:"none",
          cursor:"pointer",
          padding:"5px",
          textAlign:"left",
          color:"#0f172a",
          fontSize:"16px",
          fontWeight:"bold"
        }}
      >
        <span>{titulo}</span>
        <span>{abierta ? "▲ Ocultar" : "▼ Mostrar"}</span>
      </button>

      
<div
  className="contenido-tabla"
  style={{
    display: abierta ? "block" : "none",
    marginTop:"15px"
  }}
>
  {datos.length===0 ? (
    <p style={vacio}>
      No hay movimientos registrados en este período.
    </p>
  ) : (
    <div style={{overflowX:"auto"}}>
      <table style={tabla}>
        <thead>
          <tr>
            {columnas.map((c:any,i:number)=>(
              <th key={i} style={th}>{c.nombre}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {datos.map((d:any,i:number)=>(
            <tr key={d.id ?? i}>
              {columnas.map((c:any,j:number)=>(
                <td key={j} style={td}>
                  {c.valor(d)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


    </div>
  )
}


export default function Dashboard(){

  const hoy = fechaEcuador()

  const [desde,setDesde]=useState(hoy)
  const [hasta,setHasta]=useState(hoy)

  const [cargando,setCargando]=useState(false)
  // CONTROL DE JORNADA
const [jornada,setJornada]=useState<any>(null)
const [cargandoJornada,setCargandoJornada]=useState(false)
const [mensajeJornada,setMensajeJornada]=useState("")
// HISTORIAL DE CIERRES
const [historialCierres,setHistorialCierres]=useState<any[]>([])
const [cargandoHistorial,setCargandoHistorial]=useState(false)
  const [errores,setErrores]=useState<string[]>([])

  const [ventas,setVentas]=useState<any[]>([])
  const [prestados,setPrestados]=useState<any[]>([])
  const [vendidos,setVendidos]=useState<any[]>([])
  const [devoluciones,setDevoluciones]=useState<any[]>([])
  const [produccion,setProduccion]=useState<any[]>([])
  const [caja,setCaja]=useState<any[]>([])
  const [deudas,setDeudas]=useState<any[]>([])
  const [movimientosVehiculo,setMovimientosVehiculo]=useState<any[]>([])
  const [insumos,setInsumos]=useState<any[]>([])
  const [bodega,setBodega]=useState<any[]>([])
  const [gastos,setGastos]=useState<any[]>([])

  const [inventario,setInventario]=useState<any>({})
  const [vehiculos,setVehiculos]=useState<any[]>([])

  useEffect(()=>{
  cargarJornada()
  cargarHistorialCierres()
},[])

useEffect(()=>{
  if(desde && hasta && desde<=hasta){
    cargarReporte()
  }
},[desde,hasta])

  // CONSULTAR ESTADO DE LA JORNADA
async function cargarJornada(){

  setCargandoJornada(true)

  const {data,error} = await supabase
    .from("control_jornada")
    .select("*")
    .eq("id",1)
    .single()

  if(error){
    console.error("Error consultando jornada:",error)
    setMensajeJornada("Error consultando jornada: "+error.message)
  }else{
    setJornada(data)
    setMensajeJornada("")
  }

  setCargandoJornada(false)
}


// CONSULTAR HISTORIAL DE CIERRES
async function cargarHistorialCierres(){

  setCargandoHistorial(true)

  const {data,error} = await supabase
    .from("cierres_jornada")
    .select("*")
    .order("fecha_operativa",{ascending:false})

  if(error){
    console.error("Error consultando cierres:",error)
    alert("Error cargando historial: "+error.message)
  }else{
    setHistorialCierres(data || [])
  }

  setCargandoHistorial(false)
}


  async function cargarReporte(){

    setCargando(true)
    setErrores([])

    const tablas=[
      "ventas",
      "envases_prestados",
      "envases_vendidos",
      "produccion",
      "caja",
      "deudas",
      "movimientos_vehiculos",
      "insumos",
      "bodega",
      "gastos"
    ]

    const resultados = await Promise.all(
      tablas.map(t=>leerTabla(t,desde,hasta))
    )

    const nuevosErrores:string[]=[]

    resultados.forEach((r:any)=>{
      if(r.error) nuevosErrores.push(r.error)
    })

    setErrores(nuevosErrores)

    setVentas(resultados[0].data)
    setPrestados(resultados[1].data.filter((x:any)=>x.tipo==="prestado"))
    setDevoluciones(resultados[1].data.filter((x:any)=>x.tipo==="devuelto"))
    setVendidos(resultados[2].data)
    setProduccion(resultados[3].data)
    setCaja(resultados[4].data)
    setDeudas(resultados[5].data)
    setMovimientosVehiculo(resultados[6].data)
    setInsumos(resultados[7].data)
    setBodega(resultados[8].data)
    setGastos(resultados[9].data)

    const {data:inv,error:errorInv}=await supabase
      .from("inventario")
      .select("*")
      .eq("id",1)
      .single()

    if(errorInv){
      nuevosErrores.push("Inventario: "+errorInv.message)
    }else{
      setInventario(inv || {})
    }

    const {data:veh,error:errorVeh}=await supabase
      .from("vehiculos")
      .select("*")
      .order("codigo")

    if(errorVeh){
      nuevosErrores.push("Vehículos: "+errorVeh.message)
    }else{
      setVehiculos(veh || [])
    }

    setErrores(nuevosErrores)
    setCargando(false)
  }

  // =========================
  // VENTAS
  // =========================

  const totalVentas=ventas.reduce(
    (a,v)=>a+Number(v.total || Number(v.precio || 0)*Number(v.cantidad || 0)),0
  )

  const ventasEfectivo=ventas.filter(v=>v.pago==="efectivo")
  const ventasTransferencia=ventas.filter(v=>v.pago==="transferencia")
  const ventasFiadas=ventas.filter(v=>v.pago==="fiado")
  const ventasMixtas=ventas.filter(v=>v.pago==="mixto")
  // =========================
// CLASIFICACIÓN POR MODALIDAD
// =========================


const ventasNormales = ventas.filter(
  v => v.tipo_venta === "normal" || !v.tipo_venta
)

const ventasCortesias = ventas.filter(
  v => v.tipo_venta === "cortesia"
)

const ventasEnvasado = ventas.filter(
  v => v.tipo_venta === "envasado"
)

  const cambiosNormales=ventas.filter(v=>
    v.tipo_envase==="cambio" && v.devolucion_manual!==true
  )

  const cambiosPersonalizados=ventas.filter(v=>
    v.tipo_envase==="cambio" && v.devolucion_manual===true
  )

  // =========================
  // ENVASES
  // =========================

  const totalPrestados=prestados.reduce(
    (a,v)=>a+Number(v.cantidad || 0),0
  )

  const totalVendidos=vendidos.reduce(
    (a,v)=>a+Number(v.cantidad || 0),0
  )

  const totalDevueltos=devoluciones.reduce(
    (a,v)=>a+Number(v.cantidad || 0),0
  )

  // =========================
  // CAJA Y COBROS DE DEUDAS
  // =========================

  function esCobro(c:any){
    const detalle=(c.detalle || "").toLowerCase()
    return (
      detalle.includes("cobro deuda") ||
      detalle.includes("cobro total deuda") ||
      detalle.includes("abono deuda")
    )
  }

  const cobros=caja.filter(esCobro)

  const ingresosVentas=caja.filter(c=>
    c.tipo==="ingreso" &&
    !esCobro(c) &&
    (c.detalle || "").toLowerCase().includes("venta de")
  )

  const ingresosOtros=caja.filter(c=>
    c.tipo==="ingreso" &&
    !esCobro(c) &&
    !(c.detalle || "").toLowerCase().includes("venta de")
  )

  const egresos=caja.filter(c=>c.tipo==="egreso")

  const suma=(lista:any[],campo:string)=>{
    return lista.reduce(
      (a,x)=>a+Number(x[campo] || 0),0
    )
  }

  const ventaEfectivoCaja=suma(
    ingresosVentas.filter(c=>c.metodo==="efectivo"),"monto"
  )

  const ventaTransferenciaCaja=suma(
    ingresosVentas.filter(c=>c.metodo==="transferencia"),"monto"
  )

  const cobroEfectivo=suma(
    cobros.filter(c=>c.metodo==="efectivo"),"monto"
  )

  const cobroTransferencia=suma(
    cobros.filter(c=>c.metodo==="transferencia"),"monto"
  )

  const totalEgresos=suma(egresos,"monto")

  const totalOtrosIngresos=suma(ingresosOtros,"monto")

  const totalIngresosCaja=
    suma(caja.filter(c=>c.tipo==="ingreso"),"monto")

  const balanceMovimientos=totalIngresosCaja-totalEgresos

  // =========================
  // DEUDAS
  // =========================

  const nuevasDeudas=deudas.filter(d=>
    d.estado==="pendiente" ||
    d.estado==="pagado"
  )

  const totalFiado=suma(ventasFiadas,"total")

  const totalMixtoPendiente=suma(ventasMixtas,"restante")

  // =========================
  // PRODUCCION
  // =========================

  const totalProduccion=suma(produccion,"cantidad")
  const costoProduccion=suma(produccion,"total")

  // =========================
  // VEHICULOS
  // =========================

  const cargas=movimientosVehiculo.filter(m=>m.tipo==="carga")

  const devolucionesLlenos=movimientosVehiculo.filter(m=>
    m.tipo==="devolucion_producto_lleno"
  )

  const devolucionesVacios=movimientosVehiculo.filter(m=>
    m.tipo==="devolucion_envase_vacio"
  )

  function nombreBonito(k:string){
    const nombres:any={
      botellon20llave_llenos:"Botellón 20L con llave lleno",
      botellon20sin_llave_llenos:"Botellón 20L sin llave lleno",
      botellon20llave_vacios:"Botellón 20L vacío con llave",
      botellon20sin_llave_vacios:"Botellón 20L vacío sin llave",
      botella6000_llenos:"Botella 6000 ml",
      botella1L_llenos:"Botella 1L",
      paca15:"Paca 15 botellas",
      paca24:"Paca 24 botellas"
    }
    return nombres[k] || k
  }

  function inventarioLista(lugar:string){
    const stock=inventario?.[lugar] || {}
    return Object.entries(stock).map(([k,v]:any)=>({
      producto:nombreBonito(k),
      cantidad:Number(v || 0)
    }))
  }

  // =========================
  // INSUMOS Y BODEGA
  // =========================

  const totalComprasBodega=bodega.filter(b=>b.modo==="compra")
  const totalDañados=bodega.filter(b=>b.modo==="danado")
  const stockExistente=bodega.filter(b=>b.modo==="existente")

  const totalGastos=suma(gastos,"total")

  const formatoDinero=(n:number)=>
    "$ "+Number(n || 0).toFixed(2)


// GUARDAR COPIA COMPLETA DE LA JORNADA
async function guardarCopiaJornada(): Promise<boolean>{

  const reporteCompleto = {
    fecha: jornada?.fecha_operativa || desde,
    fecha_desde: desde,
    fecha_hasta: hasta,
    fecha_generacion: new Date().toISOString(),

    resumen: {
      total_ventas: totalVentas,
      total_produccion: totalProduccion,
      total_caja: balanceMovimientos,
      total_egresos: totalEgresos,
      total_prestados: totalPrestados,
      total_vendidos: totalVendidos,
      total_devueltos: totalDevueltos
    },

    ventas: {
      normales: ventasNormales,
      cortesias: ventasCortesias,
      envasado: ventasEnvasado,
      efectivo: ventasEfectivo,
      transferencia: ventasTransferencia,
      fiadas: ventasFiadas,
      mixtas: ventasMixtas,
      cambios_normales: cambiosNormales,
      cambios_personalizados: cambiosPersonalizados
    },

    envases: {
      prestados,
      vendidos,
      devoluciones
    },

    caja,
    deudas,
    produccion,
    movimientos_vehiculos: movimientosVehiculo,
    insumos,
    bodega,
    gastos,
    inventario,
    vehiculos
  }

  const {error} = await supabase
    .from("cierres_jornada")
    .insert([{
      fecha_operativa: jornada?.fecha_operativa || desde,
      reporte_completo: reporteCompleto,
      total_ventas: totalVentas,
      total_produccion: totalProduccion,
      total_caja: balanceMovimientos
    }])

  if(error){
  console.error(error)
  alert("Error guardando el respaldo: "+error.message)
  return false
}

  alert("✅ Respaldo completo de la jornada guardado correctamente.")
  return true
}


async function cerrarJornada(){

  if(jornada?.estado !== "abierta"){
    alert("La jornada no está abierta.")
    return
  }

    if(
    desde !== jornada.fecha_operativa ||
    hasta !== jornada.fecha_operativa
  ){
    alert("Selecciona la fecha operativa correcta antes de cerrar.")
    return
  }

  // EVITAR CIERRE CON INFORMACIÓN INCOMPLETA
if(errores.length > 0){
  alert(
    "No se puede cerrar la jornada. Hay módulos con errores de carga. Actualiza el reporte y verifica la información."
  )
  return
}

if(cargando){
  alert("Espera a que termine de cargar el reporte.")
  return
}

  const confirmar = confirm(
    "¿CONFIRMAS EL CIERRE DEL DÍA?\n\nSe guardará el reporte completo y se cerrará la jornada."
  )

  if(!confirmar) return

  const respaldoGuardado = await guardarCopiaJornada()

  if(!respaldoGuardado) return

  const {data,error} = await supabase
    .from("control_jornada")
    .update({
      estado:"cerrada",
      fecha_cierre:new Date().toISOString(),
      actualizado_en:new Date().toISOString()
    })
    .eq("id",1)
    .eq("estado","abierta")
    .select()
    .single()

  if(error || !data){
    alert("El reporte fue guardado, pero no se pudo cerrar la jornada. No repitas el cierre; verifica el estado.")
    console.error(error)
    return
  }

  setJornada(data)

  alert("🔒 JORNADA CERRADA CORRECTAMENTE")
}


  const columnasVenta=[
    {nombre:"Cliente",valor:(v:any)=>v.cliente},
    {nombre:"Producto",valor:(v:any)=>v.producto},
    {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
    {nombre:"Total",valor:(v:any)=>formatoDinero(v.total)},
    {nombre:"Pago",valor:(v:any)=>v.pago},
    {nombre:"Origen",valor:(v:any)=>v.origen}
  ]

  const columnasEnvase=[
    {nombre:"Cliente",valor:(v:any)=>v.cliente},
    {nombre:"Envase",valor:(v:any)=>nombreBonito(v.envase || v.producto || "")},
    {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
    {nombre:"Fecha",valor:(v:any)=>v.fecha}
  ]

  const columnasCaja=[
    {nombre:"Detalle",valor:(v:any)=>v.detalle},
    {nombre:"Método",valor:(v:any)=>v.metodo},
    {nombre:"Monto",valor:(v:any)=>formatoDinero(v.monto)},
    {nombre:"Fecha",valor:(v:any)=>v.fecha}
  ]

  const columnasProduccion=[
    {nombre:"Producto",valor:(v:any)=>v.producto},
    {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
    {nombre:"Costo",valor:(v:any)=>formatoDinero(v.total)}
  ]

  const columnasVehiculo=[
    {nombre:"Movimiento",valor:(v:any)=>v.tipo},
    {nombre:"Producto",valor:(v:any)=>nombreBonito(v.producto)},
    {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
    {nombre:"Origen",valor:(v:any)=>v.origen},
    {nombre:"Destino",valor:(v:any)=>v.destino},
    {nombre:"Fecha",valor:(v:any)=>v.fecha}
  ]

  const columnasInsumos=[
    {nombre:"Insumo",valor:(v:any)=>v.insumo},
    {nombre:"Movimiento",valor:(v:any)=>v.tipo},
    {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
    {nombre:"Valor",valor:(v:any)=>formatoDinero(v.total)}
  ]

  const columnasBodega=[
    {nombre:"Producto",valor:(v:any)=>nombreBonito(v.producto)},
    {nombre:"Movimiento",valor:(v:any)=>v.modo},
    {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
    {nombre:"Destino",valor:(v:any)=>v.destino},
    {nombre:"Precio",valor:(v:any)=>formatoDinero(v.precio)}
  ]

  return(
    <div style={contenedor}>

      <div style={encabezado}>
        <div>
          <h1 style={titulo}>📊 REPORTE GENERAL DIARIO</h1>
          <p style={descripcion}>
            HADOLL WATER · Control integral de operaciones
          </p>
        </div>

        <button
          style={botonActualizar}
          onClick={cargarReporte}
          disabled={cargando}
        >
          🔄 Actualizar reporte
        </button>
        <button
  onClick={()=>{
    window.print()
  }}
  style={{
    background:"#dc2626",
    color:"#fff",
    padding:"12px 18px",
    border:"none",
    borderRadius:"9px",
    cursor:"pointer",
    fontWeight:"bold",
    marginLeft:"10px"
  }}
>
  📄 DESCARGAR REPORTE PDF
</button>
      </div>


{/* ESTADO DE LA JORNADA */}

<div style={{
  background:"#fff",
  padding:"20px",
  borderRadius:"12px",
  marginBottom:"20px",
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  flexWrap:"wrap",
  gap:"15px",
  borderLeft:"6px solid",
  borderLeftColor:jornada?.estado==="abierta" ? "#16a34a" : "#dc2626"
}}>

  <div>
    <h2 style={{margin:0,fontSize:"20px"}}>
      🔐 ESTADO DE JORNADA
    </h2>

    <p style={{
      margin:"8px 0 0",
      fontWeight:"bold",
      color:jornada?.estado==="abierta" ? "#16a34a" : "#dc2626"
    }}>
      {cargandoJornada
        ? "Consultando jornada..."
        : jornada?.estado==="abierta"
          ? "🟢 JORNADA ABIERTA"
          : jornada?.estado==="cerrada"
            ? "🔴 JORNADA CERRADA"
            : "⚠️ NO SE PUDO CONSULTAR EL ESTADO"}
    </p>

    {jornada?.fecha_operativa && (
      <p style={{margin:"6px 0 0",color:"#64748b"}}>
        Fecha operativa: {jornada.fecha_operativa}
      </p>
    )}

    {mensajeJornada && (
      <p style={{color:"#dc2626",margin:"6px 0 0"}}>
        {mensajeJornada}
      </p>
    )}
  </div>

  <div style={{
    display:"flex",
    gap:"10px",
    flexWrap:"wrap"
  }}>

    <button
      style={botonActualizar}
      onClick={cargarJornada}
      disabled={cargandoJornada}
    >
      🔄 Consultar estado
    </button>

    <button
      style={{
        background:"#dc2626",
        color:"#fff",
        padding:"12px 18px",
        border:"none",
        borderRadius:"9px",
        cursor:"pointer",
        fontWeight:"bold"
      }}
      onClick={cerrarJornada}
      disabled={
        cargandoJornada ||
        jornada?.estado!=="abierta"
      }
    >
      🔒 CERRAR DÍA DE TRABAJO
    </button>

  </div>

</div>



      <div style={filtros}>
        <div>
          <label>📅 Desde</label>
          <input
            type="date"
            value={desde}
            onChange={e=>setDesde(e.target.value)}
            style={input}
          />
        </div>

        <div>
          <label>📅 Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={e=>setHasta(e.target.value)}
            style={input}
          />
        </div>

        <button
          style={botonLimpiar}
          onClick={()=>{
            setDesde(hoy)
            setHasta(hoy)
          }}
        >
          Hoy
        </button>
      </div>

      {cargando && (
        <p style={aviso}>⏳ Cargando información de todos los módulos...</p>
      )}

      {errores.length>0 && (
        <div style={errorBox}>
          <b>⚠️ Algunas consultas no pudieron cargarse:</b>
          {errores.map((e,i)=><p key={i}>{e}</p>)}
        </div>
      )}


{/* HISTORIAL DE CIERRES */}

<div style={{
  background:"#fff",
  padding:"20px",
  borderRadius:"12px",
  marginBottom:"25px"
}}>

  <div style={{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    flexWrap:"wrap",
    gap:"10px"
  }}>
    <h2>📚 HISTORIAL DE DÍAS CERRADOS</h2>

    <button
      style={botonActualizar}
      onClick={cargarHistorialCierres}
      disabled={cargandoHistorial}
    >
      🔄 Actualizar historial
    </button>
  </div>

  {cargandoHistorial ? (
    <p>Cargando historial...</p>
  ) : historialCierres.length===0 ? (
    <p>No existen jornadas cerradas todavía.</p>
  ) : (
    <div style={{overflowX:"auto"}}>
      <table style={tabla}>
        <thead>
          <tr>
            <th style={th}>Fecha</th>
            <th style={th}>Hora de cierre</th>
            <th style={th}>Ventas</th>
            <th style={th}>Producción</th>
            <th style={th}>Caja</th>
          </tr>
        </thead>

        <tbody>
          {historialCierres.map((c:any)=>(
            <tr key={c.id}>
              <td style={td}>{c.fecha_operativa}</td>
              <td style={td}>
                {new Date(c.fecha_cierre).toLocaleString("es-EC")}
              </td>
              <td style={td}>{formatoDinero(c.total_ventas)}</td>
              <td style={td}>{c.total_produccion}</td>
              <td style={td}>{formatoDinero(c.total_caja)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

</div>


      {/* RESUMEN PRINCIPAL */}

      <h2 style={tituloSeccion}>📌 Resumen del período</h2>

      <div style={grid}>

        <Card titulo="Ventas realizadas" valor={formatoDinero(totalVentas)} color="#15803d"/>
        <Card titulo="Ventas en efectivo en caja" valor={formatoDinero(ventaEfectivoCaja)} color="#16a34a"/>
        <Card titulo="Ventas por transferencia en caja" valor={formatoDinero(ventaTransferenciaCaja)} color="#2563eb"/>
        <Card titulo="Ventas fiadas" valor={formatoDinero(totalFiado)} color="#9333ea"/>
        <Card titulo="Abonos de ventas mixtas pendientes" valor={formatoDinero(totalMixtoPendiente)} color="#7c3aed"/>
        <Card titulo="Cobros de deudas en efectivo" valor={formatoDinero(cobroEfectivo)} color="#0f766e"/>
        <Card titulo="Cobros de deudas por transferencia" valor={formatoDinero(cobroTransferencia)} color="#0284c7"/>
        <Card titulo="Ingresos registrados en caja" valor={formatoDinero(totalIngresosCaja)} color="#0891b2"/>
        <Card titulo="Egresos de caja" valor={formatoDinero(totalEgresos)} color="#dc2626"/>
        <Card titulo="Balance de movimientos de caja" valor={formatoDinero(balanceMovimientos)} color="#475569"/>
      </div>

      {/* ENVASES */}

      <h2 style={tituloSeccion}>🫙 A. ENVASES Y MOVIMIENTOS</h2>

      <div style={grid}>
        <Card titulo="Envases prestados" valor={totalPrestados} color="#2563eb"/>
        <Card titulo="Envases vendidos" valor={totalVendidos} color="#0284c7"/>
        <Card titulo="Devoluciones registradas" valor={totalDevueltos} color="#16a34a"/>
        <Card titulo="Cambios normales" valor={cambiosNormales.length} color="#0f766e"/>
        <Card titulo="Cambios personalizados" valor={cambiosPersonalizados.length} color="#7c3aed"/>
      </div>

      <Tabla
        titulo="🫙 Clientes a quienes se prestaron envases"
        datos={prestados}
        columnas={columnasEnvase}
      />

      <Tabla
        titulo="💰 Clientes que compraron envases"
        datos={vendidos}
        columnas={columnasEnvase}
      />

      <Tabla
        titulo="♻️ Devoluciones de envases registradas"
        datos={devoluciones}
        columnas={columnasEnvase}
      />

      
<Tabla
  titulo="🔄 Cambios normales"
  datos={cambiosNormales}
  columnas={[
    ...columnasVenta,
    {
      nombre:"🫙 Vacíos con llave recibidos",
      valor:(v:any)=>
        v.producto?.toLowerCase().includes("con llave")
        ? Number(v.cantidad || 0)
        : 0
    },
    {
      nombre:"🫙 Vacíos sin llave recibidos",
      valor:(v:any)=>
        v.producto?.toLowerCase().includes("sin llave")
        ? Number(v.cantidad || 0)
        : 0
    }
  ]}
/>


      
<Tabla
  titulo="🔄 Cambios personalizados"
  datos={cambiosPersonalizados}
  columnas={[
    ...columnasVenta,
    {
      nombre:"🫙 Vacíos con llave recibidos",
      valor:(v:any)=>Number(v.vacios_con_llave || 0)
    },
    {
      nombre:"🫙 Vacíos sin llave recibidos",
      valor:(v:any)=>Number(v.vacios_sin_llave || 0)
    }
  ]}
/>


      
      {/* VENTAS */}

      <h2 style={tituloSeccion}>💰 B. DETALLE DE VENTAS POR MODALIDAD</h2>

      <div style={grid}>
        <Card
          titulo="🛒 Ventas normales"
          valor={`${ventasNormales.length} ventas · ${formatoDinero(suma(ventasNormales,"total"))}`}
          color="#16a34a"
        />

        <Card
          titulo="🎁 Ventas de cortesía"
          valor={`${ventasCortesias.length} ventas · ${formatoDinero(suma(ventasCortesias,"total"))}`}
          color="#f59e0b"
        />

        <Card
          titulo="💧 Ventas solo envasado"
          valor={`${ventasEnvasado.length} ventas · ${formatoDinero(suma(ventasEnvasado,"total"))}`}
          color="#0891b2"
        />

       
      </div>

      <Tabla
        titulo="🛒 DETALLE DE VENTAS NORMALES"
        datos={ventasNormales}
        columnas={columnasVenta}
      />

      <Tabla
        titulo="🎁 DETALLE DE VENTAS DE CORTESÍA"
        datos={ventasCortesias}
        columnas={columnasVenta}
      />

      <Tabla
        titulo="💧 DETALLE DE VENTAS SOLO ENVASADO"
        datos={ventasEnvasado}
        columnas={columnasVenta}
      />

     
      <h3 style={subtitulo}>💳 DESGLOSE POR FORMA DE PAGO</h3>

      <Tabla titulo="💵 Ventas en efectivo" datos={ventasEfectivo} columnas={columnasVenta}/>

      <Tabla titulo="🏦 Ventas por transferencia" datos={ventasTransferencia} columnas={columnasVenta}/>

      <Tabla titulo="📒 Ventas fiadas" datos={ventasFiadas} columnas={columnasVenta}/>

      <Tabla
        titulo="⚖️ Ventas mixtas"
        datos={ventasMixtas}
        columnas={[
          ...columnasVenta,
          {nombre:"Abono",valor:(v:any)=>formatoDinero(v.abono)},
          {nombre:"Pendiente",valor:(v:any)=>formatoDinero(v.restante)}
        ]}
      />


      {/* CUENTAS POR COBRAR */}

      <h2 style={tituloSeccion}>💳 C. CUENTAS POR COBRAR</h2>

      <Tabla
        titulo="📒 Deudas generadas en el período"
        datos={nuevasDeudas}
        columnas={[
          {nombre:"Cliente",valor:(v:any)=>v.cliente},
          {nombre:"Producto",valor:(v:any)=>v.producto},
          {nombre:"Cantidad",valor:(v:any)=>v.cantidad},
          {nombre:"Monto",valor:(v:any)=>formatoDinero(v.monto)},
          {nombre:"Estado",valor:(v:any)=>v.estado},
          {nombre:"Fecha",valor:(v:any)=>v.fecha}
        ]}
      />

      <Tabla
        titulo="💵 Cobros y abonos de deudas realizados"
        datos={cobros}
        columnas={[
          {nombre:"Cliente",valor:(v:any)=>(v.detalle || "").replace(/Cobro total deuda |Cobro deuda |Abono deuda /i,"").trim()},
          {nombre:"Detalle",valor:(v:any)=>v.detalle},
          {nombre:"Método",valor:(v:any)=>v.metodo},
          {nombre:"Monto cobrado",valor:(v:any)=>formatoDinero(v.monto)},
          {nombre:"Fecha",valor:(v:any)=>v.fecha}
        ]}
      />

      {/* CAJA */}

      <h2 style={tituloSeccion}>💵 D. MOVIMIENTOS DE CAJA</h2>

      <div style={grid}>
        <Card titulo="Ventas efectivo recibidas" valor={formatoDinero(ventaEfectivoCaja)} color="#16a34a"/>
        <Card titulo="Ventas transferencias recibidas" valor={formatoDinero(ventaTransferenciaCaja)} color="#2563eb"/>
        <Card titulo="Cobros efectivo" valor={formatoDinero(cobroEfectivo)} color="#0f766e"/>
        <Card titulo="Cobros transferencia" valor={formatoDinero(cobroTransferencia)} color="#0284c7"/>
        <Card titulo="Otros ingresos" valor={formatoDinero(totalOtrosIngresos)} color="#64748b"/>
        <Card titulo="Egresos" valor={formatoDinero(totalEgresos)} color="#dc2626"/>
      </div>

      <Tabla titulo="📋 Todos los movimientos de caja" datos={caja} columnas={[
        {nombre:"Tipo",valor:(v:any)=>v.tipo},
        {nombre:"Detalle",valor:(v:any)=>v.detalle},
        {nombre:"Método",valor:(v:any)=>v.metodo},
        {nombre:"Monto",valor:(v:any)=>formatoDinero(v.monto)},
        {nombre:"Fecha",valor:(v:any)=>v.fecha}
      ]}/>

      {/* PRODUCCION */}

      <h2 style={tituloSeccion}>🏭 E. PRODUCCIÓN</h2>

      <div style={grid}>
        <Card titulo="Unidades producidas" valor={totalProduccion} color="#ea580c"/>
        <Card titulo="Registros de producción" valor={produccion.length} color="#c2410c"/>
        <Card titulo="Costo registrado de producción" valor={formatoDinero(costoProduccion)} color="#9a3412"/>
      </div>

      <Tabla titulo="🏭 Producción realizada" datos={produccion} columnas={columnasProduccion}/>

      {/* VEHICULOS */}

      <h2 style={tituloSeccion}>🚚 F. CONTROL DE VEHÍCULOS</h2>

      {vehiculos.map((v:any,i:number)=>(
        <div key={i} style={vehiculoCard}>
          <h3>🚚 {v.codigo} · {v.marca || ""} · {v.placa || ""}</h3>
          <p><b>Chofer:</b> {v.chofer || "-"}</p>

          {v.codigo==="vehiculo1" && (
            <>
              <Tabla
                titulo="Movimientos históricos del Vehículo 1"
                datos={movimientosVehiculo}
                columnas={columnasVehiculo}
              />
              <h4>Existencias actuales del vehículo</h4>
              <Tabla
                titulo="Inventario actual"
                datos={inventarioLista("vehiculo1")}
                columnas={[
                  {nombre:"Producto",valor:(x:any)=>x.producto},
                  {nombre:"Cantidad actual",valor:(x:any)=>x.cantidad}
                ]}
              />
            </>
          )}

          {v.codigo==="vehiculo2" && (
            <Tabla
              titulo="Inventario actual"
              datos={inventarioLista("vehiculo2")}
              columnas={[
                {nombre:"Producto",valor:(x:any)=>x.producto},
                {nombre:"Cantidad actual",valor:(x:any)=>x.cantidad}
              ]}
            />
          )}
        </div>
      ))}

      <div style={tablaCard}>
        <h3 style={subtitulo}>📦 Cargas registradas</h3>
        <Tabla titulo="Productos cargados" datos={cargas} columnas={columnasVehiculo}/>
        <Tabla titulo="Devolución de productos llenos" datos={devolucionesLlenos} columnas={columnasVehiculo}/>
        <Tabla titulo="Devolución de envases vacíos" datos={devolucionesVacios} columnas={columnasVehiculo}/>
      </div>

      {/* INVENTARIO */}

      <h2 style={tituloSeccion}>📦 G. INVENTARIO GENERAL ACTUAL</h2>

      {["empresa","dorita","vehiculo1","vehiculo2"].map((lugar,i)=>(
        <Tabla
          key={i}
          titulo={"Inventario: "+lugar.toUpperCase()}
          datos={inventarioLista(lugar)}
          columnas={[
            {nombre:"Producto",valor:(x:any)=>x.producto},
            {nombre:"Existencias",valor:(x:any)=>x.cantidad}
          ]}
        />
      ))}

      {/* INSUMOS */}

      <h2 style={tituloSeccion}>🧪 H. INSUMOS Y MATERIALES</h2>

      <Tabla
        titulo="Movimientos de insumos del período"
        datos={insumos}
        columnas={columnasInsumos}
      />

      {/* BODEGA */}

      <h2 style={tituloSeccion}>🏬 I. BODEGA GENERAL</h2>

      <div style={grid}>
        <Card titulo="Compras" valor={totalComprasBodega.length} color="#2563eb"/>
        <Card titulo="Productos dañados" valor={totalDañados.length} color="#dc2626"/>
        <Card titulo="Stock existente registrado" valor={stockExistente.length} color="#16a34a"/>
      </div>

      <Tabla titulo="Movimientos de bodega" datos={bodega} columnas={columnasBodega}/>

      <Tabla titulo="Gastos registrados" datos={gastos} columnas={[
        {nombre:"Tipo",valor:(v:any)=>v.tipo},
        {nombre:"Descripción",valor:(v:any)=>v.descripcion},
        {nombre:"Total",valor:(v:any)=>formatoDinero(v.total)},
        {nombre:"Fecha",valor:(v:any)=>v.fecha}
      ]}/>

      <div style={pie}>
        <h3>HADOLL WATER · REPORTE GENERAL</h3>
        <p>Período consultado: {desde} hasta {hasta}</p>
        <p>Información obtenida directamente de los módulos del sistema.</p>
        <button style={botonActualizar} onClick={cargarReporte}>
          🔄 Actualizar información
        </button>
      </div>

    </div>
  )
}

function Card({titulo,valor,color}:any){
  return(
    <div style={{...tarjeta, borderTop:"5px solid "+color}}>
      <p style={tarjetaTitulo}>{titulo}</p>
      <h2 style={tarjetaValor}>{valor}</h2>
    </div>
  )
}

// =========================
// ESTILOS
// =========================

const contenedor:any={
  background:"#f1f5f9",
  minHeight:"100vh",
  padding:"30px",
  color:"#0f172a",
  fontFamily:"Arial, sans-serif"
}

const encabezado:any={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  flexWrap:"wrap",
  gap:"15px",
  marginBottom:"25px"
}

const titulo={
  fontSize:"32px",
  fontWeight:"bold",
  margin:0
}

const descripcion={
  color:"#64748b",
  marginTop:"8px"
}

const tituloSeccion={
  fontSize:"23px",
  marginTop:"40px",
  marginBottom:"18px",
  borderBottom:"2px solid #cbd5e1",
  paddingBottom:"10px"
}

const filtros:any={
  display:"flex",
  alignItems:"end",
  gap:"15px",
  flexWrap:"wrap",
  background:"#fff",
  padding:"20px",
  borderRadius:"12px",
  marginBottom:"25px"
}

const input:any={
  display:"block",
  marginTop:"7px",
  padding:"11px",
  border:"1px solid #cbd5e1",
  borderRadius:"8px",
  fontSize:"15px"
}

const grid:any={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",
  gap:"15px",
  marginBottom:"20px"
}

const tarjeta:any={
  background:"#fff",
  padding:"20px",
  borderRadius:"12px",
  boxShadow:"0 3px 10px rgba(0,0,0,0.06)",
  minHeight:"105px"
}

const tarjetaTitulo:any={
  color:"#64748b",
  fontWeight:"bold",
  fontSize:"14px",
  margin:0
}

const tarjetaValor:any={
  fontSize:"25px",
  marginTop:"12px",
  marginBottom:0,
  color:"#0f172a"
}

const tablaCard:any={
  background:"#fff",
  padding:"20px",
  borderRadius:"12px",
  marginTop:"15px",
  marginBottom:"20px",
  boxShadow:"0 3px 10px rgba(0,0,0,0.05)"
}

const subtitulo={
  fontSize:"18px",
  marginTop:0,
  marginBottom:"18px"
}

const tabla:any={
  width:"100%",
  borderCollapse:"collapse" as const,
  fontSize:"14px"
}

const th:any={
  background:"#1e293b",
  color:"#fff",
  padding:"13px",
  textAlign:"left" as const,
  whiteSpace:"nowrap" as const
}

const td:any={
  padding:"12px",
  borderBottom:"1px solid #e2e8f0",
  textAlign:"left" as const
}

const vacio={
  color:"#94a3b8",
  padding:"15px"
}

const botonActualizar:any={
  background:"#2563eb",
  color:"#fff",
  padding:"12px 18px",
  border:"none",
  borderRadius:"9px",
  cursor:"pointer",
  fontWeight:"bold"
}

const botonLimpiar:any={
  background:"#64748b",
  color:"#fff",
  padding:"12px 18px",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer"
}

const aviso:any={
  background:"#dbeafe",
  padding:"15px",
  borderRadius:"8px",
  color:"#1e40af"
}

const errorBox:any={
  background:"#fee2e2",
  color:"#991b1b",
  padding:"18px",
  borderRadius:"10px",
  marginBottom:"20px"
}

const vehiculoCard:any={
  background:"#fff",
  padding:"20px",
  borderRadius:"12px",
  marginTop:"20px"
}

const pie:any={
  background:"#1e293b",
  color:"#fff",
  padding:"25px",
  borderRadius:"12px",
  textAlign:"center" as const,
  marginTop:"40px"
}
