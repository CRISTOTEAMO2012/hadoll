export function obtenerInventario(){

let inventario = JSON.parse(localStorage.getItem("inventarioCentral"))

if(!inventario){

inventario = {

botellonConLlave:{
empresa:{vacios:0,llenos:0},
dorita:{vacios:0,llenos:0},
prestados:0
},

botellonSinLlave:{
empresa:{vacios:0,llenos:0},
dorita:{vacios:0,llenos:0},
prestados:0
},

botellas600:{
empresa:{vacias:0},
paca15:0,
paca24:0
},

botellas6000:{
empresa:{vacias:0,llenas:0},
dorita:{llenas:0}
}

}

localStorage.setItem("inventarioCentral",JSON.stringify(inventario))

}

return inventario

}



export function guardarInventario(data){

localStorage.setItem("inventarioCentral",JSON.stringify(data))

}