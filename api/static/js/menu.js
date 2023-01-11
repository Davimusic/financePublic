let arr = [['imagen', 'https://res.cloudinary.com/dplncudbq/image/upload/v1658015902/mias/i1_ndc8ga.png'],['/ingresos', 'Ingresos'],['/egresos', 'Egresos'], ['/vistaDeFlujoReferencias', 'flujos por referencias'], ['/vistaDeFlujoCompactado', 'flujos compactado'], ['/anotaciones', 'anotaciones'], ['/crudreferencias', 'manipular referencias'], ['/salir', '<a href="/salir"><img style="height: 40px;" src="https://res.cloudinary.com/dplncudbq/image/upload/v1672767743/mias/salir_eyzxfp.png" alt="" srcset=""></a>'], ['', '']]
//<img style="height: 25px;" src="https://res.cloudinary.com/dplncudbq/image/upload/v1657473822/mias/red-304573_xrlhrp.png" alt="" srcset="">

function menu(){
    //let menuID = document.getElementById("menu");
    let divPadre = document.getElementById("padreMenu")
    divPadre.style.height = heightPantalla()
    divPadre.style.overflow = "scroll";
    //divPadre.style.background = "red"
    let anchoPantalla = window.innerWidth;
    let cod = "", display = "", anchoAUsar = "", clasEsconder = "", eventoMenuCelular = "";
    let alturaMenu = 30;

    //if(anchoPantalla <= 1000){ para hacer que sea en modo celular siempre
        display = "block"
        anchoAUsar = `height: 0px;`
        clasEsconder = "none"
        eventoMenuCelular = 'onclick="menuCelular()"'
    /*} else {
        console.log(anchoPantalla);
        display = "flex"
    }*/
    
    cod += 
    `
    <div id="menuDesplegable" style="margin: none; ${anchoAUsar}   background-image: url('https://res.cloudinary.com/dplncudbq/image/upload/v1670631081/mias/fondoConta_wlzfws.png');"  class="sticky sobresalir contenedorGaleria flex">
        <ul class="${display} espacioEquilatero ListaLimpia">
    `
        for (let i = 0; i < arr.length; i++) {
            if(arr[i][0] != 'imagen'){
                resaltar = ""
                if(arr[i][0] == window.location.pathname){
                    resaltar = "color2 sombra"
                }
                cod +=`    
                <li class='${resaltar} ${clasEsconder} textoMenu efectoMenu' style="border-radius: 20em; margin: 15px; width:fit-content;"><a class='ListaLimpia mano' style="height:33px; padding-left: 10px; padding-right: 10px" href="${arr[i][0]}">${arr[i][1]}</a></li>
                `
            } else {
                cod +=`    
                <li class=''><img id="eventoMenuCelular" ${eventoMenuCelular} style="height: ${alturaMenu - 5}px;" class='mano efectoMenu borde1' src="${arr[i][1]}" alt="" ></li>
                `
            }
        }
    cod += 
    ` 
        </ul>
        <H1 id='titulo' style='${retornarDecicionResponsiva('padding-left: 15%;', 'padding-left:45%;')}'>${window.location.pathname}</H1>
    </div>
    `
    return cod;
    //console.log(cod);
    //menuID.innerHTML = cod;
}

let bandera = 0
function menuCelular(){
    let alturaPantalla = window.innerHeight;
    let menu = document.getElementById("menuDesplegable")
    let botonMenu = document.getElementById("eventoMenuCelular")
    let titulo = document.getElementById('titulo')

    menu.style.transition = "0.5s";
    botonMenu.style.transition = "0.5s";
    titulo.style.transition = "0.5s";
    if(bandera  == 0 ){
        bandera = 1
        menu.style.height = `${alturaPantalla}px`
        setTimeout(mostrarTextoMenu, 600);
        botonMenu.style.marginTop = `${((window.innerHeight / 100) * 20)}px`
        titulo.style.marginLeft= retornarDecicionResponsiva('padding-left: 15%;', 'padding-left:35%;');
    } else {
        bandera = 0
        menu.style.height = `0px` //sacado de la altura que queda al renderizar en modo Movil
        mostrarTextoMenu("cerrar")
        botonMenu.style.marginTop = `0px`
        titulo.style.marginLeft= retornarDecicionResponsiva('padding-left: 35%;', 'padding-left:15%;');;
    }
}

function mostrarTextoMenu(acc){
    let arreglo = document.getElementsByClassName("textoMenu"); //arrojada por la variable clasEsconder
    for (let i = 0; i < arreglo.length; i++) {
        if(acc == "cerrar"  || bandera == 0){
            arreglo[i].classList.replace("flex", "none")
        } else {
            arreglo[i].classList.replace("none", "flex")
        }
    }
}