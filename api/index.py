from flask import Flask, render_template, request, redirect, session
import pymongo                 
from bson.objectid import ObjectId  # para poder usar _id de mongo
from datetime import datetime


app = Flask(__name__)
app.secret_key = 'mi clave secreta'


#conexcion a base de datos     
myClient = pymongo.MongoClient("mongodb+srv://davis123:davis123@cluster0.hujqu.mongodb.net/test3")
myDb = myClient["contabilidadPublica"]#basde de datos
myCollection=myDb["coleccion1"]#coleccion1


def cambiarValor(busca, cambia, text):
    tex = ''
    for u in text:
        if(u == busca):
            tex += cambia
        else:
            tex += u          
    return tex

def CRUD(accion, valorNum, ruta):

    if valorNum == "negativo":
        dinero =  retornarNumeroNegativo(int(request.form.get("dinero", '')))
    else:
        dinero = request.form.get("dinero", '')    
    
    referencia = request.form.get("referencia", '')
    fecha = cambiarValor('-', '/', request.form.get("fecha", '')) 
    texto = request.form.get("texto", '')
    codUnico = request.form.get("codUnico", '')
    signoNumerico = request.form.get("signoNumerico", '')
    print(f'signoNumerico: {signoNumerico}')

    if(accion == "crear"):

        now = datetime.now()
        info = {"referencia": referencia, "dinero": dinero, "fecha": fecha, "texto": cambiarValor(',', '-', texto), "fechaDeCreacion": f"{now.year}/{now.month}/{now.day}"}
        myCollection.insert_one(info) 

    elif(accion == "editar"):

        if signoNumerico == 'negativo':
            dinero = retornarNumeroNegativo(int(dinero))
        else:
            dinero = retornarNumeroPositivo(int(dinero))

        query = {"_id": ObjectId(codUnico)}
        updateTask = {"$set":{"referencia": referencia, "dinero": dinero, "fecha": fecha, "texto": cambiarValor(',', '-', texto)}}
        myCollection.update_one(query, updateTask)

    elif(accion == "borrar"):

        myCollection.delete_one({'_id': ObjectId(codUnico)}) 

    return redirect(ruta)    

def retornarStringInformacion(arr, acc):
    texto = ""
    for user in arr:
        info = ""
        id = str([user['_id']])
        idFiltrado = ""
        for i in range(11, (len(id)-3)):
            idFiltrado += id[i]
        if acc == "negativo":
            if int(user['dinero']) < 0:
                info = f"{user['referencia']}${user['dinero']}${user['fecha']}${user['texto']}${retornarSigoNumerico(int(user['dinero']))}${idFiltrado}º" 
        elif acc == "positivo":
            if int(user['dinero']) >= 0:
                info = f"{user['referencia']}${user['dinero']}${user['fecha']}${user['texto']}${retornarSigoNumerico(int(user['dinero']))}${idFiltrado}º"
        elif acc == "todos":
                info = f"{user['referencia']}${user['dinero']}${user['fecha']}${user['texto']}${retornarSigoNumerico(int(user['dinero']))}${idFiltrado}º"               
        texto += info
    #print(f"texto: {texto}") 
    return texto        

def retornarSigoNumerico(num):
    if num < 0:
        return 'negativo'
    else:
        return 'positivo' 

def retornarReferencias():
    texto = ""
    buscarReferencias = myCollection.find({'nombresReferencias': {'$exists': True}})
    for i in buscarReferencias:
        for u in i['nombresReferencias']:
            texto += u + "$"
    texto = texto[:-1]  
    texto += "º"
    return texto

def retornarNumeroNegativo(num):
    if num >= 0:
        return -num
    else:
        return num     

def retornarNumeroPositivo(num):
    if num > 0:
        return num
    else:
        return (-1 * num)

def retornarSignoSeparador():
    return "Z"

def filtroBuscar():
    buscarReferencia = request.form.get('buscarReferencia', '')
    buscarFecha = request.form.get('buscarFecha', '')
    return redirect(f'/{buscarReferencia}{retornarSignoSeparador()}{buscarFecha}')
    
def retornarInfoReferencia(valorNum):
    now = datetime.now()
    buscarInfo = myCollection.find({'referencia': {'$exists': True}, 'fechaDeCreacion': f"{now.year}/{now.month}/{now.day}"})
    textContenido = ""
    textContenido += retornarReferencias()
    textContenido += retornarStringInformacion(buscarInfo, valorNum)    
    print(textContenido)    
    return render_template('index.html', texto = textContenido)

def retornarReferenciasDesglosadas():

    dicc = {}
    nombresReferencias = myCollection.find({'nombresReferencias': {'$exists': True}})

    for i in nombresReferencias:
        for u in i['nombresReferencias']:
            referencias = myCollection.find({'referencia': u})
            arr = ['@ingresos@', '@egresos@']
            for q in arr:
                for i in range(1, 13):
                    num = ''
                    if i <= 9:
                        num = f'0{i}'
                    else:
                        num = i    
                    dicc[f'{u}{q}{num}'] = 0           
            for a in referencias:
                
                mes = a['fecha'][5:7]
                dinero = int(a['dinero'])
                if dinero < 0:
                    dicc[f'{u}@egresos@{mes}'] += int(a['dinero']) 
                else:
                    dicc[f'{u}@ingresos@{mes}'] += int(a['dinero'])  

    text = f'{retornarReferencias()},'
    for i in dicc:
        print(i)
        print(dicc[i])
        text += f"{str(i)}@{str(dicc[i])}@,"

    return text
    #return render_template('graficosAnual.html', meses = text)

def validacionLogeo(siLograLogear,siNoLogralogear):
    
    usu = "admin"
    contrasena = 'admin'
    usuario = request.form.get("usuario")
    password = request.form.get("contrasena")
    if siLograLogear == '':
        if session['usuario'] == usu:
            return 'si esta logeado'
        else:
            return 'no esta logeado'    
    elif usu == usuario and password == contrasena or session.get('usuario') == usu:
        session['usuario'] = usu
        return  eval(siLograLogear)
    else:
        return eval(siNoLogralogear)

def update(id, llave, valor):
    query = {"_id": ObjectId(id)}
    updateTask = {"$set":{llave: valor}}
    myCollection.update_one(query, updateTask)

@app.route('/', methods=["GET", "POST"])
def logeo():
    
    if request.method == "POST": 
        return validacionLogeo("redirect('/ingresos')", "render_template('logeo.html', mensaje = 'error de logeo')")   
    else:
        return validacionLogeo("redirect('/ingresos')", "render_template('logeo.html', mensaje = '')")

@app.route('/ingresos', methods=["GET", "POST"])
def inicio():

    if request.method == "POST": 
        accion = request.form["formUso"]
        if accion == "filtroBuscar":
            return filtroBuscar()   
        else:
            return CRUD(accion, '', "/")    
    else:   
        return validacionLogeo("retornarInfoReferencia('positivo')", "redirect('/')")

@app.route('/egresos', methods=["GET", "POST"])
def egresos():
    
    if request.method == "POST": 
        accion = request.form["formUso"]
        if accion == "filtroBuscar":
            return filtroBuscar()
        else:
            return CRUD(accion, 'negativo', "/egresos")        
    else:  
        return validacionLogeo("retornarInfoReferencia('negativo')", "redirect('/')")

@app.route('/vistaDeFlujoReferencias', methods=["GET", "POST"])
def vistaDeFlujoReferencias():
    if validacionLogeo('', '') ==  'si esta logeado':
        return render_template('graficosAnual.html', meses = retornarReferenciasDesglosadas())
    else:
        return redirect('/')       
    
@app.route('/vistaDeFlujoCompactado', methods=["GET", "POST"])
def vistaDeFlujoCompactado():
    if validacionLogeo('', '') ==  'si esta logeado':
        return render_template('graficosAnual.html', meses = retornarReferenciasDesglosadas())
    else:
        return redirect('/')   

@app.route('/crudreferencias', methods=["GET", "POST"])
def crudreferencias():
    if request.method == "POST": 
        accion = request.form["formUso"]
        crear = request.form["crear"]
        cambiar = request.form["cambiar"]
        nuevocambiar = request.form["nuevocambiar"]
        borrar = request.form["borrar"]

        

        if accion == 'crear':

            nombresReferencias = myCollection.find({'nombresReferencias': {'$exists': True}})

            if crear == '':
                return render_template('crudReferencias.html', texto = retornarReferenciasDesglosadas(), aviso = 'campo vacio ingresado, no es posible.')
            
            arr = []
            for i in nombresReferencias:
                idBaseDeDatos = i['_id']
                for u in i['nombresReferencias']:
                    if(u == crear):
                        return render_template('crudReferencias.html', texto = retornarReferenciasDesglosadas(), aviso = 'referencia ya existente')
                    else:    
                        arr.append(u) 
            arr.append(crear)

            update(idBaseDeDatos, 'nombresReferencias', arr)
            
        elif accion == 'cambiar':

            if nuevocambiar == '':
                return render_template('crudReferencias.html', texto = retornarReferenciasDesglosadas(), aviso = 'campo vacio ingresado, no es posible.')
            
            nombresReferencias = myCollection.find({'nombresReferencias': {'$exists': True}})

            for i in nombresReferencias:
                for u in i['nombresReferencias']:
                    if u == nuevocambiar:
                        return render_template('crudReferencias.html', texto = retornarReferenciasDesglosadas(), aviso = 'referencia ya existente')
            
            referencias = myCollection.find({'referencia': {'$exists': True}})
            for i in referencias:
                if(i['referencia'] == nuevocambiar):
                        return render_template('crudReferencias.html', texto = retornarReferenciasDesglosadas(), aviso = 'referencia ya existente')
                id = i['_id']
                if i['referencia'] == cambiar:
                    update(id, 'referencia', nuevocambiar)
        
            arr = []
            nombresReferencias = myCollection.find({'nombresReferencias': {'$exists': True}})
            for i in nombresReferencias:
                idBaseDeDatos = i['_id']
                for u in i['nombresReferencias']:
                    if u == cambiar:
                        arr.append(nuevocambiar)
                    else:
                        arr.append(u) 
            update(idBaseDeDatos, 'nombresReferencias', arr)   
                    
        elif accion == 'borrar':

            referencias = myCollection.find({'referencia': {'$exists': True}})

            for i in referencias:
                id = i['_id']
                if i['referencia'] == borrar:
                    myCollection.delete_one({'_id': ObjectId(id)}) 

            nombresReferencias = myCollection.find({'nombresReferencias': {'$exists': True}})

            arr = []
            for i in nombresReferencias:
                idBaseDeDatos = i['_id']
                for u in i['nombresReferencias']:
                    if u != borrar:
                        arr.append(u)         
            update(idBaseDeDatos, 'nombresReferencias', arr)   
                    
        return redirect('/crudreferencias')
    else:  
        return render_template('crudReferencias.html', texto = retornarReferenciasDesglosadas(), aviso = '') 

@app.route('/<dato>', methods=["GET", "POST"])
def filtroReferencia(dato):

    busqueda = []
    for u in dato.split(retornarSignoSeparador()):
        busqueda.append(u)
    referencia = busqueda[0]
    fecha = busqueda[1]    

    if request.method == "GET":
        
        if referencia != '' and fecha == '':
            buscarInfo = myCollection.find({'referencia': referencia})
        elif referencia == '' and fecha != '': 
            buscarInfo = myCollection.find({'fecha': cambiarValor('-', '/', fecha)}) 
        else:
            buscarInfo = myCollection.find({'referencia': referencia, 'fecha': cambiarValor('-', '/', fecha)})

        texto = ""
        texto += retornarReferencias()
        texto += retornarStringInformacion(buscarInfo, "todos")
        if validacionLogeo('', '') ==  'si esta logeado':
            return render_template('index.html', texto = texto)
        else:
            return redirect('/')       

    else:

        accion = request.form["formUso"]
        if accion == "filtroBuscar":
            return filtroBuscar()
        else:
            return CRUD(accion, '', "/") 

@app.route('/anotaciones', methods=["GET", "POST"])
def anotaciones():

    buscar = myCollection.find({'anotaciones': {'$exists': True}})
    if request.method == "GET":
        
        texto = ""
        for i in buscar:
            texto += i['anotaciones']
        print(texto)    
        return render_template('anotaciones.html', mensaje = str(texto))

    else:
        
        for i in buscar:
            id = i['_id']
        anotaciones = request.form.get("anotaciones", '')
        update(id, 'anotaciones', anotaciones)

        return redirect('/anotaciones')

@app.route('/salir')
def salir():
    session['usuario'] = ''
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True, port=5002)    