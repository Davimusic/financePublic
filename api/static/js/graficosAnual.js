let arrContenido = [], flujo = '', refenciaActual = '', arrReferencias =  [], path = '';

function infoAnual(meses){
    path = window.location.pathname
    arrContenido = traducirInformacionGraficos(`${meses}`)
    flujo = 'ingresos'
    arrReferencias = ordenarAlfaNumerico(retornarReferenciasGraficos(meses))
    refenciaActual = arrReferencias[0]
    crearGrafica()
}

function retornarFiltroReferencias(arr){
    let Referencia = arr
    let flujo = ['ingresos', 'egresos']

    let text = `
        <div style="${retornarDecicionResponsiva('padding-top:40px;', 'padding-top:50px;')} ${retornarDecicionResponsiva('display:block;', 'display:flex;')} justify-content: space-between; width: 85%; padding-right: 2%; padding-left: 2%; margin:0px auto;">`
            if(path != '/vistaDeFlujoCompactado'){
                text +=
                `<div class="" style="margin-bottom:10px; padding-right: 2%;">
                    <label for="">Referencia</label>
                </div> 
                <select onchange="refrescarGrafico('referencia', this.id, this.value)" style="height: 25px; width:100%;" class="borde1" id="selectGraficoReferencia">`
                for (let u = 0; u < Referencia.length; u++) {
                    text +=`<option value="${Referencia[u]}">${Referencia[u]}</option>`
                }
                text +=    
                `
                </select>`
            } 
                text += `
                <div class="" style="margin-bottom:10px; padding-right: 2%; ${retornarDecicionResponsiva('padding-top:10px;', '')}">
                    <label for="">Flujo</label>
                </div> 
                <select onchange="refrescarGrafico('flujo', this.id, this.value)" style="height: 25px; width:100%;" class="borde1" id="selectGraficoFlujo">`
                for (let u = 0; u < flujo.length; u++) {
                    text +=`<option value="${flujo[u]}">${flujo[u]}</option>`
                }
                text +=    
                `
                </select> 
        </div>
    ` 
    return text;
}

function refrescarGrafico(acc, id, val){
    console.log(`acc: ${acc},  id: ${id},  val: ${val}`);
    
    let select = document.getElementById(id)
    let valor = select.value

    if(acc == 'flujo'){
        flujo = valor
    } else {
        refenciaActual = valor
    }

    crearGrafica()
    actualizarValorSlide(id, valor)
}

let diccFlitros = {}
function actualizarValorSlide(id, valor){
    diccFlitros[id] = valor
    for (const key in diccFlitros) {
        document.getElementById(key).value = diccFlitros[key];
    }
    console.log(diccFlitros)
}

function retornarReferenciasGraficos(text){
    let referencia = text.split(',')
    referencia = referencia[0].split('$')
    referencia[referencia.length - 1] = referencia[referencia.length - 1].substring(0, referencia[referencia.length - 1].length - 1);
    return referencia
}

function traducirInformacionGraficos(text){
    let arr = []
    let arrtext = text.split(',');
    for (let e = 1; e < arrtext.length; e++) {
        arr.push(arrtext[e].split('@'))
        arr[e -1].pop()
    } 
    arr.pop()   
    //console.log(arr);
    return arr
}

function retornarInformacionCoordenadaArr(arr, index){
    let arre = []
    for (let u = 0; u < arr.length; u++) {
        arre.push(arr[u][parseInt(index)])        
    }
    console.log(arre);
    return arre
}

function retornarTablaFlujo(ingre, egres, total){
    
    let arr = [ingre, egres, total]
    let arrTitulos = ['Ingresos', 'Egresos', 'Flujo actual']
    let cod = ''
    cod += `
    <div style='text-align: center; justify-content: center; padding-top:15%; margin: 5%;'>
        <H1 class='borde1' style="${retornarDecicionResponsiva('margin-left: 20%;', '')} width:200px; background:#1312129a;">Vista flujo anual</H1>
        <table class="borde1" style="margin:0px auto; background:#1312129a; width: 200px;">`
        let banderaColor = 0;
        for (let u = 0; u < arr.length; u++) {
            color = ''
            if(banderaColor == 0){
                banderaColor = 1
            } else {
                banderaColor = 0
                color = 'background:#3c8179;'
            }
            cod += `
            <tr style="${color}"><th>${arrTitulos[u]}</th>
            <td> ${arr[u]} </td> </tr>`
        }
        cod += `
        </table> 
    </div>`

    return cod
}

function retornarTraducirDiccionario_a_Arreglo(dicc){
    let arr = []
    for (const u in dicc) {
        arr.push(dicc[u])
    }
    return arr
}

function crearGrafica(){

    //console.log(arrReferencias); 
    //console.log(arrContenido);
    
    let cadena = [], arrFiltrado = [], sumaIngresos = 0, sumaEgresos = 0
    
    let dicc = {'01':'enero', '02':'febrero', '03':'marzo', '04':'abril', '05':'mayo', '06':'junio', '07':'julio', '08':'agosto', '09':'septiembre', '10':'octubre', '11':'noviembre', '12':'diciembre'}
    let diccCompactoIngresos = {'enero': 0, 'febrero': 0, 'marzo': 0, 'abril': 0, 'mayo': 0, 'junio': 0, 'julio': 0, 'agosto': 0, 'septiembre': 0, 'octubre': 0, 'noviembre': 0, 'diciembre': 0}
    let diccCompactoEgresos = {'enero': 0, 'febrero': 0, 'marzo': 0, 'abril': 0, 'mayo': 0, 'junio': 0, 'julio': 0, 'agosto': 0, 'septiembre': 0, 'octubre': 0, 'noviembre': 0, 'diciembre': 0}
    let labels = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviemre", "diciembre"]
    if(path == '/vistaDeFlujoReferencias'){
        for (let u = 0; u < arrContenido.length; u++) {
            if(arrContenido[u][0] == refenciaActual && arrContenido[u][1] == flujo){
                arrFiltrado.push(arrContenido[u][3])
            }
            
            if(arrContenido[u][0] == refenciaActual){
                if(arrContenido[u][1] == 'ingresos'){
                    sumaIngresos += parseInt(arrContenido[u][3])
                } else {
                    sumaEgresos += parseInt(arrContenido[u][3])
                }
            }
        }
    } else {
        refenciaActual = 'brutos'
        for (let u = 0; u < arrContenido.length; u++) {
                
                if(arrContenido[u][1] == 'ingresos'){
                    diccCompactoIngresos[dicc[arrContenido[u][2]]] += parseInt(arrContenido[u][3])
                    sumaIngresos += parseInt(arrContenido[u][3])
                } else {
                    diccCompactoEgresos[dicc[arrContenido[u][2]]] += parseInt(arrContenido[u][3])
                    sumaEgresos += parseInt(arrContenido[u][3])
                }
        }
        
        if(flujo == 'ingresos'){
            arrFiltrado = retornarTraducirDiccionario_a_Arreglo(diccCompactoIngresos)
        } else {
            arrFiltrado = retornarTraducirDiccionario_a_Arreglo(diccCompactoEgresos)
        }
    }
    
    console.log(arrFiltrado);
    console.log(labels);
    
    labels = labels
    cadena = [{
        label: `${flujo} ${refenciaActual} `,  
        data: arrFiltrado,  
        backgroundColor: '#00B4D8',  
    },]
    

    let tab = `width: ${((window.innerWidth / 100) * 80)}px; height: ${((window.innerHeight / 100) * 90)}px;`
    let cel = `width: ${((window.innerWidth / 100) * 100)}px; height: ${((window.innerHeight / 100) * 110)}px;`

    let dinerosTraducidosParaPocentajes = []
    /*/de prueba, testeo
    if(flujo == 'ingresos'){
        arrFiltrado = [1471000, 50000, 2000000, 1300000, 700000, 0, 0, 0, 0, 50000, 0, 0]
    } else {
        arrFiltrado = [-1471000, -50000, -2000000, -1300000, -700000, 0, -4000000, -3000, 0, -50000, 0, -4500000]
    }*/

    dinerosTraducidosParaPocentajes = retornarDinerosEnPocentajes(arrFiltrado)
    //console.log(dinerosTraducidosParaPocentajes);
    
    let cod = ''

    cod += 
    `
    ${menu()}
    ${retornarFiltroReferencias(arrReferencias)}
    <div style="text-align: center; justify-content: center; ${retornarDecicionResponsiva(cel, tab)} ${retornarDecicionResponsiva('padding-top: 3%;', 'padding-top: 5%;')} overflow-x: auto; margin:0px auto; ${retornarDecicionResponsiva('display: block;', 'display: flex;')}">
        ${retornarTablaFlujo(sumaIngresos, sumaEgresos, (sumaIngresos + sumaEgresos))}
        <div class="borde1 padding1 sombra" style="background: #1312129a; height:fit-content; display:block; ${retornarDecicionResponsiva('', 'margin-Left:5%;')} ${retornarDecicionResponsiva('margin-top: 10%;', '')}">
        <h3 style='text-align: center; justify-content: center; margin: 2%;'>${flujo} ${refenciaActual}</h3>`
        for (let u = 0; u < dinerosTraducidosParaPocentajes.length; u++) {
        cod += retornarBarrasEstadisticas(`barra${u}`, arrFiltrado[u], labels[u])
        }
    cod += `    
        </div>
    </div>`
    
    document.getElementById('padreMenu').innerHTML = cod
    
    generarAnimacionBarras(dinerosTraducidosParaPocentajes)
}

function retornarDinerosEnPocentajes(arre){
    //console.log(arre);    

    let arr = [], maxValue = 1;
    for (let u = 0; u < arre.length; u++) {
        let valor = retornarNumSiemprePositivo(parseInt(arre[u]))
        if(valor > maxValue){
            maxValue = valor
        }
    }
    //console.log(`max value : ${maxValue}`);
    for (let u = 0; u < arre.length; u++) {
        let nuevoValor = (parseInt(arre[u]) * retornarDecicionResponsiva(200, 400))/maxValue // el 200 y 400 el el maximo valor que declarè en el div que muestra el porcentaje
        if(nuevoValor < 0){
            nuevoValor = -1 * nuevoValor
        }
        //console.log(`nuevoValor: ${nuevoValor}`);
        arr.push(nuevoValor)
    }
    //console.log(arr);
    return arr
}

function retornarNumSiemprePositivo(num){
    //console.log(num);
    if(num < 0){
        num = -1 * num
    }
    //console.log(num);
    return num
}

function retornarBarrasEstadisticas(id, dineroBruto, mes){
    let cod = `
    <div style="display:flex; margin-bottom: 1%;">
        <label style="width: 100px;" for="">${mes}</label>
        <div style="background: none; width: ${retornarDecicionResponsiva(210, 410)}px;">
            <div class="borde1" id='${id}' style="background:#3c8179; height: 25px;" ></div>
        </div>
        <label style="width: 100px; padding-left: 5%;" for="">${dineroBruto}</label>
    </div>`
    return cod
} 

let copiaDinerosTraducidosParaPocentajes = []
function generarAnimacionBarras(dinerosTraducidosParaPocentajes){
    copiaDinerosTraducidosParaPocentajes = dinerosTraducidosParaPocentajes
    for (let u = 0; u < 12; u++) {
        let ba = `barra${u}`
        let barra = document.getElementById(ba)
        barra.style.transition = '1000ms';
        barra.style.width = `0px`;
        barra.style.background = '#0077B6';
    }
    setTimeout(correrBarras, 300)
}

function correrBarras(){
    for (let u = 0; u < 12; u++) {
        let ba = `barra${u}`
        let barra = document.getElementById(ba)
        barra.style.transition = '3s';
        barra.style.width = `${copiaDinerosTraducidosParaPocentajes[u]}px`;
        if(flujo == 'egresos'){
            barra.style.background = 'red';
        } else {
            barra.style.background = '#3c8179';
        }
    }
}


    /* var ctx = document.getElementById('myChart').getContext('2d');

    var chart = new Chart(ctx, {
      type: 'bar',  // Tipo de gráfico: barras
        data: {
            labels: labels,  // Etiquetas para cada barra
            datasets: cadena
        },
        options: {
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: ``,
                    fontColor: '#ffffff',  
                },
                ticks: {
                    fontColor: '#ffffff',
                    stepSize: 10
                    
                }
                    }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Dinero',
                    fontColor: '#ffffff'  
                },
            ticks: {
                fontColor: '#ffffff',
                stepSize: 10
            }
            }]
        },
        legend: {
            labels: {
                fontColor: '#ffffff'  
            }
            }
        }
    });
    chart.options.scales.yAxes[0].ticks.display = false;
    chart.update();
}*/