/**
 * Javascript específico para crear las series de datos que necesita Flot, y pasárselas.
 * - Magnitudes: € / % / M
 * - Probar cookies en servidor
 * - PER 10 años
 */
var series = [];
var seriesDibujar = [];


function inicializacion() {
    // Recorremos la lista de empresas y para cada una generamos todas las series
    funciones.sort(function (f1,f2) {
        //return empr1.nombre.localeCompare(empr2.nombre);
        if (f1.etiqueta<f2.etiqueta) return -1;
        if (f2.etiqueta<f1.etiqueta) return 1;
        return 0;
    });
    var clr=0;
    Object.keys(empresas).sort().forEach(key => {
        var empresa = empresas[key];

        // Añadimos empresa al desplegable y su div correspondiente
        crearDiv(empresa.nombreID,empresa.nombreTexto);

        // Creamos las series a mostrar
        // El numero indica el eje Y a usar, y por tanto su escala:
        //  - El mismo concepto en cada empresa usa el mismo número, para que usen el mismo eje.
        //  - Conceptos de mangnitud parecida deberían usar el mismo número: Por ejemplo, todos los porcentajes.
        funciones.forEach(f => {
            var clave = f.funcion.name+empresa.nombreID;
            var serie = calculaSerie(empresa,f.funcion,false);
            if (serie.length>0) {
                addSerie(f.eje,empresa.nombreTexto,serie,clave,f.etiqueta,clr,false,true);
                var serieVar = calculaSerie(empresa,f.funcion,true);
                addSerie(1,empresa.nombreTexto,serieVar,clave+"var","Variación "+f.etiqueta,clr,false,true);
                creaOpciones(empresa.nombreID,clave,f.etiqueta);
            }
            clr++;
        });
    });
}


// Creamos serie y para cada año calculamos el dato
function calculaSerie(empresa,funcion,esVariacion)
{
    var serie = [];
    if (!esVariacion) {
        for (var year in empresa.historico) {
            var datosYear = empresa.historico[year];
            if (datosYear) {
                var dato = funcion(datosYear);
                if (dato) {
                    serie.push([year, dato]);
                }
            }
        }
    } else {
        for (var year in empresa.historico) {
            var datosActuales = empresa.historico[year];
            var datosAnteriores = empresa.historico[year-1];
            if (datosActuales && datosAnteriores) {
                var dato = variacionDato(funcion,datosAnteriores,datosActuales);
                if (dato) {
                    serie.push([year, dato]);
                }
            }
        }
    }
    return serie;
}



/**
 * Añade una serie a la lista de series para dibujar (variable global "series") y al div proporcionado.
 * @param {Array} series Objeto global que contiene todas las series (checked o not checked)
 */ 
function addSerie(ejeY,empresa,serie,clave,lbl,clr,mostrarBars,mostrarLines,rellenar)
{
    // Metemos los datos de dibujado (etiqueta/datos/color) de cada serie
    var objSerie = {
        label: empresa+": "+lbl,
        data: serie, 
        color: clr, 
        bars: { show: false, fill: true },
        lines: { show: true, fill: true },
        yaxis: ejeY
        //points: {show: false }
    }
    series[clave] = objSerie;
}



/**
 * Dibuja el gráfico en un div, y usa otro div como tooltip para mostrar datos de los puntos cuando el ratón pasa sobre ellos (evento plothover).
 * @param {Element} grafico 
 * @param {Element} tooltip 
 */
function dibujar(grafico,tooltip) 
{
    // Definimos diferentes tipos de opciones generales (independientes de la serie)
    var opcionesLineas = {
        points: {show: true }       // Puntos va a mostrar siempre. El resto de tipos (lines, bars, lines.fill, bars.fill) se parametrizan por serie.
    };
    var opcionesRejilla = {
        hoverable: true,
        clickable: true
    };
    var opcionesEjeY = {
        tickFormatter: formatoNumeros       // Funcion que formatea las cifras para que se vean mejor
    };

    // Juntamos todas las opciones y dibujamos las series con ellas
    var opcionesGenerales = {
        series: opcionesLineas
        ,grid: opcionesRejilla
        ,yaxis: opcionesEjeY
    }
    var plot = $.plot("#"+grafico, seriesDibujar, opcionesGenerales);

    // Enganchamos evento al grafico, para controlar respuestas a acciones de ratón
    $("#"+grafico).bind("plothover", function (event, pos, item) {
        if (item) { // Para evitar que se dibujen valores nulos. Pendiente de pulir, por lo que veo.
            var x = item.datapoint[0].toFixed();
            var	y = formatoNumeros(item.datapoint[1]);  // Formateamos el dato del tooltip igual que en el eje (tickFormatter).

            var texto = x+": "+y;
            $("#"+tooltip).html(texto)
                .css({top: item.pageY+5, left: item.pageX+5})
                .fadeIn(200);
        } else {
            $("#"+tooltip).hide();
        }
    });
}


/**
 * Formatea para que las cifras sean más manejables.
 * @param {Number} numero 
 * @param {*} axis
 */
function formatoNumeros(numero,axis) {
    if (numero>1.00E6 || numero<-1.00E6) {
        numero = (numero/1.00E6).toFixed(2)+"M";
    } else {
        numero = numero.toFixed(2);
    }
    return numero;
}
