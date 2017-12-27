'use strict';

//===========================================================================================
// 1) LISTA DE DATOS QUE DEBEMOS TENER DISPONIBLES
//  { eje: num eje, etiqueta: "nombre serie", funcion: funcion a invocar }
//
// El numero de eje indica el eje "Y" a usar, y por tanto su escala:
//  - El mismo concepto en cada empresa usa el mismo número, para que usen el mismo eje.
//  - Conceptos de mangnitud parecida deberían usar el mismo número: Por ejemplo, todos los porcentajes en el eje número 1.
//
// La funcion a invocar es una de las funciones que tengo definidas en la sección 4, abajo.
//===========================================================================================
var funciones = [
    // Eje 1: Porcentajes, ratios (normalmente -100% -> 100%)
     {eje: 1,etiqueta: "Payout"              ,funcion: payout    }
    ,{eje: 1,etiqueta: "EBITDA/Ventas"       ,funcion: ebitda_ventas    }
    ,{eje: 1,etiqueta: "EBIT/Ventas"         ,funcion: ebit_ventas      }
    ,{eje: 1,etiqueta: "Deuda neta/EBITDA"   ,funcion: deudaNeta_ebitda }
    //,{eje: 1,etiqueta: "RPD Máxima"          ,funcion: rpdMaxima }    Por ahora me centro en la RPD Media
    //,{eje: 1,etiqueta: "RPD Mínima"          ,funcion: rpdMinima }
    ,{eje: 1,etiqueta: "RPD Media"           ,funcion: rpdMedia  }
    ,{eje: 1,etiqueta: "ROA"                 ,funcion: roa       }
    ,{eje: 1,etiqueta: "ROE"                 ,funcion: roe       }
    // Eje 2: Magnitudes relacionadas con valor de acción
    ,{eje: 2,etiqueta: "BPA"                 ,funcion: bpa       }
    ,{eje: 2,etiqueta: "DPA"                 ,funcion: dpa       }
    ,{eje: 2,etiqueta: "Valor contable"      ,funcion: vc_accion }
    ,{eje: 2,etiqueta: "Cotiz. máxima"       ,funcion: cotizacionMaxima }
    ,{eje: 2,etiqueta: "Cotiz. mínima"       ,funcion: cotizacionMinima }
    ,{eje: 2,etiqueta: "Cotiz. media"        ,funcion: cotizacionMedia  }
    // Eje 3: Magnitudes relacionadas con tamaño de la empresa
    ,{eje: 3,etiqueta: "Num. Acciones"       ,funcion: numAcciones  }
    ,{eje: 3,etiqueta: "Ingresos"            ,funcion: ingresos  }
    ,{eje: 3,etiqueta: "Gastos"              ,funcion: gastos    }
    ,{eje: 3,etiqueta: "Activo"              ,funcion: activo    }
    ,{eje: 3,etiqueta: "Pasivo"              ,funcion: pasivo    }
    ,{eje: 3,etiqueta: "Capitalización media",funcion: capitalizacionMedia    }
    ,{eje: 3,etiqueta: "Patrimonio neto"     ,funcion: patrimonioNeto}
    ,{eje: 3,etiqueta: "Deuda neta"          ,funcion: deudaNeta }
    ,{eje: 3,etiqueta: "EBITDA"              ,funcion: ebitda    }
    ,{eje: 3,etiqueta: "EBIT"                ,funcion: ebit      }
    ,{eje: 3,etiqueta: "Beneficio Neto"      ,funcion: beneficioNeto      }
    ,{eje: 3,etiqueta: "Cash Flow Explotación" ,funcion: cashFlowExplotacion  }
    ,{eje: 3,etiqueta: "Cash Flow Inversión"   ,funcion: cashFlowInversion    }
    ,{eje: 3,etiqueta: "Cash Flow Financiación",funcion: cashFlowFinanciacion }
    ,{eje: 3,etiqueta: "Cash Flow Neto"        ,funcion: cashFlowNeto }
    // Eje 4: Magnitudes entre 0 y 20-30 como PER y otros
    //,{eje: 3,etiqueta: "PER Máximo"          ,funcion: perMaximo }    // PER máximo y mínimo no les veo mucha utilidad por ahora
    //,{eje: 3,etiqueta: "PER Mínimo"          ,funcion: perMinimo }
    ,{eje: 4,etiqueta: "PER Medio"           ,funcion: perMedio  }
    //,{eje: 2,etiqueta: "Precio/VC máximo"    ,funcion: precio_vc_maximo  }  // Aquí tampoco usamos máximos y mínimos
    //,{eje: 2,etiqueta: "Precio/VC mínimo"    ,funcion: precio_vc_minimo  }
    ,{eje: 2,etiqueta: "Precio/VC medio"     ,funcion: precio_vc_medio  }
];



//==============================================================================
// 2) FUNCIONES PARA DEVOLVER DATOS FUNDAMENTALES
//  Aquí programamos las funciones que hemos declarado en el punto 1.
//  Cualquier dato que queramos mostrar en la gráfica, tendrá que conseguirse mediante una de estas funciones.
//==============================================================================
/**
 * RESUMEN:
 * numAcciones = DATO
 * vc_accion = DATO
 *       ¿vc_accion = patrimonioNeto / NumAcciones? En caso de que tuviese patrimonioNeto
 * ingresos = DATO
 * ebitda = DATO
 *       ¿ebitda = ingresos - gastos?
 * ebit = DATO
 * beneficioNeto = DATO
 * dpa = DATO
 * deudaNeta = DATO
 *      deudaNeta = deuda total - efectivo [pero por ahora no veo necesario manejar esos datos]
 * cotizacionMaxima = DATO
 * cotizacionMinima = DATO
 * cashFlowExplotacion = DATO
 * cashFlowFinanciacion = DATO
 * cashFlowInversion = DATO
 * roa = DATO
 *      roa = EBIT / Activo [beneficio respecto a los activos totales (¡pero no tengo Activo!)]
 *
 * ebitda_ventas = ebitda / ingresos
 * ebit_ventas = ebit / ingresos
 * bpa = beneficioNeto / NumAcciones
 * payout = 100 * dpa / bpa
 * deudaNeta_ebitda = deudaNeta / ebitda
 * cashFlowNeto = cashFlowExplotacion + cashFlowFinanciacion + cashFlowInversion     (cashFlowInversion en su valor negativo, no pasado a positivo)
 * cotizacionMedia = (cotizacionMaxima + cotizacionMinima)/2
 * perMaximo = cotizacionMaxima / bpa
 * perMinimo = cotizacionMinima / bpa
 * perMedio = cotizacionmedia / bpa
 * rpdMaxima = (100*dpa)/cotizacionMaxima
 * rpdMedia = (100*dpa)/cotizacionMedia
 * rpdMinima = (100*dpa)/cotizacionMinima
 * patrimonioNeto = VC_Accion * NumAcciones  [preferiría usar Activo-Pasivo pero no los tengo]
 * activo = ebit / roa
 * pasivo = activo - patrimonioNeto
 * gastos = ingresos - ebitda
 * capitalizacionMedia = cotizacionMedia * NumAcciones
 * deudaNeta_cfe = deudaNeta / cashFlowExplotacion
 * roe = beneficioNeto / patrimonioNeto
 * 
 * FALTAN:
 * ROCE
 * CFE-CFI-PID (???)
 * EV / EBITDA medio
 */

 /**
  * Número de acciones.
  * Dato fijo.
  * [ Beneficio Total / BPA = Num. Acciones ]
  */
function numAcciones(empresa) {
    if (empresa.NumAcciones) {
        return empresa.NumAcciones;
    } 
}

/**
 * Valor contable por accion.
 * [VC_Accion = Patrimonio neto / Numero de acciones]
 * Ahora mismo lo tenemos como dato, no calculado.
 */
function vc_accion(empresa) {
    if (empresa.VC_Accion) {
        return empresa.VC_Accion;
    } else 
    if (empresa.PatrimonioNeto && empresa.NumAcciones) {
        return empresa.PatrimonioNeto / empresa.NumAcciones;
    } else {
        return null;
    }
}

/**
 * Ingresos.
 * Este valor lo tendremos como dato siempre, creo. Por tanto, no lo calculo mediante ninguna fórmula. Nunca.
 */
function ingresos(empresa) {
    if (empresa.Ingresos) {
        return empresa.Ingresos;
    } else {
        return null;
    }
}

/**
 * Earnings Before Interests,Taxes,Depreciations,Amortizations.
 * [ EBITDA = Beneficio neto + Intereses + Taxes + Depreciation + Amortization ]
 * Beneficio únicamente considerando la actividad productiva de la empresa.
 * ¿Más simple: [ EBITDA = Ingresos - Gastos ]?
 * En estas pruebas lo estoy manejando como dato proporcionado. Veremos si es fácil conseguir datos separados de I,T,D,A
 * El dato "Gastos" (que sería igual a "ingresos - EBITDA") no lo manejo por ahora.
 */
function ebitda(empresa) {
    if (empresa.EBITDA) {
        return empresa.EBITDA;
    } else
    if (empresa.Ingresos && empresa.Gastos) {
        return empresa.Ingresos - empresa.Gastos;
    } else {
        return null;
    }
}

/**
 * Earnings Before Interests & Taxes.
 * [ EBIT = Beneficio neto + Intereses + Taxes ]
 * [ EBIT = EBITDA - Depreciaciones - Amortizaciones ]
 * Beneficio antes de impuestos.
 * Que sea creciente.
 * Por ahora, dato proporcionado. Veremos si puedo derivarlo de E,I,T,D,A en diferentes combinaciones.
 */
function ebit(empresa) {
    if (empresa.EBIT) {
        return empresa.EBIT;
    } else {
        return null;
    }
}


/**
 * Beneficio Neto (Resultado Neto).
 * Por ahora lo tengo como dato proporcionado.
 * Si no lo tengo, lo intento calcular a partir del BPA. [Beneficio Neto = BPA * NumAcciones]
 * ¿[Beneficio Neto = EBITDA - Impuestos ]? Pero hay que tener el dato de impuestos.
 */
function beneficioNeto(empresa) {
    if (empresa.BeneficioNeto) {
        return empresa.BeneficioNeto;
    } else 
    if (empresa.BPA && empresa.NumAcciones) {
        return empresa.BPA*empresa.NumAcciones;
    }
    else {
        return null;
    }
}

/**
 * Dividendo por Acción.
 * Lo voy a manejar siempre como dato fijo.
 * @param {*} empresa 
 */
function dpa(empresa)
{
    if (empresa.DPA) {
        return empresa.DPA;
    }
    else return null;
}

/**
 * Deuda Neta = Deuda Total - Efectivo y equivalentes
 * Por el momento va a ser un dato proporcionado.
 * @param {*} empresa 
 */
function deudaNeta(empresa) {
    if (empresa.DeudaNeta) {
        return empresa.DeudaNeta;
    }
    else return null;
}

/**
 * Valor máximo de la acción en el año.
 * @param {*} empresa 
 */
function cotizacionMaxima(empresa) {
    if (empresa.CotizacionMaxima) {
        return empresa.CotizacionMaxima;
    }
    else return null;
}

/**
 * Valor mínimo de la acción en el año.
 * @param {*} empresa 
 */
function cotizacionMinima(empresa) {
    if (empresa.CotizacionMinima) {
        return empresa.CotizacionMinima;
    }
    else return null;
}

/**
 * Cash Flow de Explotación
 * [CFE = Ingresos - Gastos] = beneficio por actividad ordinaria.
 * Dato.
 * @param {*} empresa 
 */
function cashFlowExplotacion(empresa) {
    if (empresa.CashFlowExplotacion) {
        return empresa.CashFlowExplotacion;
    }
    else return null;
}

/**
 * Cash Flow de Inversión
 * [ CFI = Gastos para inversiones - Ingresos para desinversiones ]
 * Dato.
 * Suele ser negativo: Se invierte para crecer, al vender (desinvertir) la empresa decrece.
 * Si hay mucha deuda puede ser bueno que sea positivo, para reducir deuda. Pero será algo puntual. No se puede hacer año tras año.
 * Usamos su valor negado, entonces, para que aparezca en el eje positivo.
 * Duda: ¿Negamos el valor, o lo almacenamos negado? Depende de si lo usaremos en otros cálculos.
 * @param {*} empresa 
 */
function cashFlowInversion(empresa) {
    if (empresa.CashFlowInversion) {
        return -empresa.CashFlowInversion;
    }
    else return null;
}

/**
 * Return on Assets
 * [ ROA = EBIT / Activos Totales ]
 * Dato.
 * @param {*} empresa 
 */
function roa(empresa) {
    if (empresa.ROA) {
        return empresa.ROA;
    }
    else return null;
}



/**
 * Cash Flow de Financiación
 * [CFF = Emisión de deuda - Pago de deuda]
 * Dato.
 * Al emitir deuda aumenta liquidez. Ej: Ampliaciones capital. Al pagar deuda (o dividendo) disminuye liquidez. Por tanto este CF equivale a variación de liquidez.
 * Normalmente es positivo cuando la empresa se está endeudando. Y netagivo cuando paga sus deudas.
 * Pero puede pasar que la empresa emita deuda pero el CF sea negativo, porque se pague un dividendo sacado de la deuda. Mal asunto.
 * @param {*} empresa 
 */
function cashFlowFinanciacion(empresa) {
    if (empresa.CashFlowFinanciacion) {
        return empresa.CashFlowFinanciacion;
    }
    else return null;
}


/**
 * Ratio EBITDA/Ventas (margen EBITDA, margen de beneficio)
 * Porcentaje de ingresos que se convierten en beneficios.
 * Relación entre los beneficios y el volumen de ventas: Nos da el rendimiento que se saca a dichas ventas.
 * [ EBITDA_Ventas = EBITDA / Ingresos ]
 * @param {*} empresa 
 */
function ebitda_ventas(empresa) {
    var ebitdaEmpresa = ebitda(empresa);
    if (empresa.EBITDA_Ventas) {
        return empresa.EBITDA_Ventas;
    } else
    if (ebitdaEmpresa && empresa.Ingresos) {
        return (100*ebitdaEmpresa)/empresa.Ingresos;
    } else {
        return null;
    }
}

/**
 * Ratio EBIT/Ventas (margen EBIT)
 * Relación entre los beneficios y el volumen de ventas: Nos da el rendimiento que se saca a dichas ventas.
 * [ EBIT_Ventas = EBIT / Ingresos ]
 * @param {*} empresa 
 */
function ebit_ventas(empresa) {
    var ebitEmpresa = ebit(empresa);
    if (empresa.EBIT_Ventas) {
        return empresa.EBIT_Ventas;
    } else
    if (ebitEmpresa && empresa.Ingresos) {
        return (100*ebitEmpresa)/empresa.Ingresos;
    } else {
        return null;
    }
}


/**
 * Beneficio por Acción.
 * BPA = BeneficioNeto / NumAcciones
 * Muchas veces lo tendremos, pero tenemos la posibilidad de calcularlo partiendo del beneficio total.
 */
function bpa(empresa) {
    if (empresa.BPA) {
        return empresa.BPA;
    }
    else
    if (empresa.BeneficioNeto && empresa.NumAcciones) {
        return empresa.BeneficioNeto / empresa.NumAcciones;
    }
    else return null;
}

/**
 * Payout = 100 * DPA / BPA
 */
function payout(empresa) {
    var bpaEmpresa = bpa(empresa);
    if (bpaEmpresa && (empresa.DPA || empresa.DPA==0)) {
        return 100 * empresa.DPA / bpaEmpresa;
    } else {
        return null;
    }
}

/**
 * Deuda Neta / EBITDA.
 * Años que costaría liquidar la deuda con los ingresos actuales.
 * En general entre 2 y 3. A partir de 4 ya empieza a ser demasiado.
 * @param {*} empresa 
 */
function deudaNeta_ebitda(empresa)
{
    var ebitdaEmpresa = ebitda(empresa);
    if (empresa.DeudaNeta && ebitdaEmpresa) {
        return empresa.DeudaNeta/ebitdaEmpresa;
    }
    else return null;
}

/**
 * Cash Flow Neto.
 * Suma de los tres CF.
 * @param {*} empresa 
 */
function cashFlowNeto(empresa) {
    var ret = 0;
    if (empresa.CashFlowExplotacion)  ret = empresa.CashFlowExplotacion;
    if (empresa.CashFlowInversion)    ret+= empresa.CashFlowInversion;
    if (empresa.CashFlowFinanciacion) ret+= empresa.CashFlowFinanciacion;
    return ret;
}


/**
 * Cotización media
 * (Cotización Máxima + Cotización Mínima) / 2
 * @param {*} empresa 
 */
function cotizacionMedia(empresa) {
    if (empresa.CotizacionMaxima && empresa.CotizacionMinima) {
        return (empresa.CotizacionMaxima + empresa.CotizacionMinima)/2;
    }
    else return null;
}


function perMaximo(empresa) {
    var bpaEmpresa = bpa(empresa);
    if (empresa.CotizacionMaxima && bpaEmpresa) {
        return empresa.CotizacionMaxima/bpaEmpresa;
    }
    else return null;
}

function perMinimo(empresa) {
    var bpaEmpresa = bpa(empresa);
    if (empresa.CotizacionMinima && bpaEmpresa) {
        return empresa.CotizacionMinima/bpaEmpresa;
    }
    else return null;
}

function perMedio(empresa) {
    var cotizacionMediaEmpresa = cotizacionMedia(empresa);
    var bpaEmpresa = bpa(empresa);
    if (cotizacionMediaEmpresa && bpaEmpresa) {
        return cotizacionMediaEmpresa/bpaEmpresa;
    }
    else return null;
}


function rpdMaxima(empresa) {
    var cotizacionMaximaEmpresa = cotizacionMaxima(empresa);
    var dpaEmpresa = dpa(empresa);
    if (cotizacionMaximaEmpresa && dpaEmpresa) {
        return (100*dpaEmpresa)/cotizacionMaximaEmpresa;
    }
    else return null;
}

function rpdMinima(empresa) {
    var cotizacionMinimaEmpresa = cotizacionMinima(empresa);
    var dpaEmpresa = dpa(empresa);
    if (cotizacionMinimaEmpresa && dpaEmpresa) {
        return (100*dpaEmpresa)/cotizacionMinimaEmpresa;
    }
    else return null;
}

function rpdMedia(empresa) {
    var cotizacionMediaEmpresa = cotizacionMedia(empresa);
    var dpaEmpresa = dpa(empresa);
    if (cotizacionMediaEmpresa && dpaEmpresa) {
        return (100*dpaEmpresa)/cotizacionMediaEmpresa;
    }
    else return null;
}


/**
 * [Patrimonio Neto = Activo - Pasivo] ¡Pero no tenemos activo ni pasivo!
 * [Patrimonio Neto = Valor Contable por acción * Número acciones] Usamos esto por ahora. No me gusta mucho.
 */
function patrimonioNeto(empresa) {
    if (empresa.PatrimonioNeto) {
        return empresa.PatrimonioNeto;
    } else
    if (empresa.Activo && empresa.Pasivo) {
        return empresa.Activo - empresa.Pasivo;
    } else
    if (empresa.VC_Accion && empresa.NumAcciones) {
        return empresa.VC_Accion * empresa.NumAcciones;
    } else {
        return null;
    }
}


/**
 * Activo de la empresa.
 * Preferiría tenerlo, pero en caso contrario:
 *      [ROA = EBIT / Activo]  ==>  [Activo = EBIT / ROA]
 */
function activo(empresa) {
    if (empresa.Activo) {
        return empresa.Activo;
    } else
    if (empresa.EBIT && empresa.ROA) {
        return empresa.EBIT / empresa.ROA;
    } else {
        return null;
    }
}



/**
 * Pasivo de la empresa.
 * [Patrimonio Neto = Activo - Pasivo]  ==>  [Pasivo = Activo - Patrimonio Neto]
 * ¿Deuda bruta? No se suele usar, se tira de deuda neta.
 */
function pasivo(empresa) {
    if (empresa.Pasivo) {
        return empresa.Pasivo;
    } else
    if (activo(empresa) && patrimonioNeto(empresa)) {
        return activo(empresa) - patrimonioNeto(empresa);
    } else {
        return null;
    }
}



/**
 * Gastos.
 * [EBITDA = Ingresos - Gastos]  ==>  [Gastos = Ingresos - EBITDA]
 * Ahora mismo tenemos el dato EBITDA así que éste será calculado.
 */
function gastos(empresa) {
    if (empresa.Gastos) {
        return empresa.Gastos;
    } else
    if (empresa.Ingresos && empresa.EBITDA) {
        return empresa.Ingresos - empresa.EBITDA;
    } else {
        return null;
    }
}


/** 
 * Precio/Valor contable máximo
 */
function precio_vc_maximo(empresa) {
    if (empresa.cotizacionMaxima && empresa.VC_Accion) {
        return empresa.cotizacionMaxima / empresa.VC_Accion;
    } else {
        return null;
    }
}


/** 
 * Precio/Valor contable mínimo
 */
function precio_vc_minimo(empresa) {
    if (empresa.cotizacionMinima && empresa.VC_Accion) {
        return empresa.cotizacionMinima / empresa.VC_Accion;
    } else {
        return null;
    }
}

/** 
 * Precio/Valor contable medio
 */
function precio_vc_medio(empresa) {
    var cotizacionMediaEmpresa = cotizacionMedia(empresa);
    if (cotizacionMediaEmpresa && empresa.VC_Accion) {
        return cotizacionMediaEmpresa / empresa.VC_Accion;
    } else {
        return null;
    }
}

/** 
 * Capitalización bursátil media.
 * [ capitalización = cotización * numAcciones ]
 */
function capitalizacionMedia(empresa) {
    var cotizacionMediaEmpresa = cotizacionMedia(empresa);
    if (cotizacionMediaEmpresa && empresa.NumAcciones) {
        return cotizacionMediaEmpresa * empresa.NumAcciones;
    } else {
        return null;
    }
}


/**
 * Ratio Deuda Neta / Cash Flow Explotación
 */
function deudaNeta_cfe(empresa) {
    var deudaNetaEmpresa = deudaNeta(empresa);
    var cfeEmpresa = cashFlowExplotacion(empresa);
    if (deudaNetaEmpresa && cfeEmpresa) {
        return deudaNetaEmpresa/cfeEmpresa;
    } else {
        return null;
    }
}

/**
 * Return on Equity
 * Porcentaje de beneficio respecto al capital aportado.
 * [ ROE = Beneficio neto / Patrimonio neto ] --> En realidad Beneficio neto / Fondos propios.
 */
function roe(empresa) {
    var beneficioEmpresa = beneficioNeto(empresa);
    var patrimonioEmpresa = patrimonioNeto(empresa);
    if (beneficioEmpresa && patrimonioEmpresa) {
        return (100*beneficioEmpresa)/patrimonioEmpresa;
    } else {
        return null;
    }
}


/**
 * Me faltan:
  - ROCE (Return on Capital Employed)
    Porcentaje de beneficio respecto al capital empleado.
    El capital empleado usa el patrimonio neto (fondos propios) eliminando la influencia de la deuda y el exceso de liquidez.
    ROCE = EBIT / (Patrimonio Neto + Deuda - Liquidez)
    ROCE = Resultado explotación / (Activos totales - Pasivos)

  - CFE-CFI-PID (???)

  - EV / EBITDA medio
        EV = Valor de empresa = Capitalización + Deuda (lo que el mercado calcula que valen los activos de la empresa)
        EV/EBITDA bueno en la zona 6-8.

**/



//==============================================================================
// 3) OTRAS FUNCIONES
//==============================================================================

/**
 * Función para calcular la variación de cualquier dato que se saque con funcion(empresa,year).
 * @param {Function} funcion 
 * @param {Object} empresa 
 * @param {Number} year 
 */
function variacionDato(funcion,datosAnteriores,datosActuales) {
    var datoActual = funcion(datosActuales);
    var datoAnterior = funcion(datosAnteriores);
    if (datoActual && datoAnterior) {
        return 100*(datoActual-datoAnterior)/datoAnterior;
    } else {
        return 0;
    }
}


function creaEmpresa(nombre,sector) {
    var obj = {
        nombreID : codifica(nombre)
        ,nombreTexto  : nombre
        ,sector : sector
    }
    empresas[obj.nombreID] = obj;
    return obj;
}

// Aquí la función que genera el histórico a partir de las series
function inicializa(empresa) {
    empresa.historico= new Map();
    var i=0;
    for (i=0; i<empresa.years.length; i++) {
        var year = empresa.years[i];
        empresa.historico[year] = {};
        if (empresa.NumAcciones)    empresa.historico[year].NumAcciones = empresa.NumAcciones[i];
        if (empresa.VC_Accion)      empresa.historico[year].VC_Accion = empresa.VC_Accion[i];
        if (empresa.Ingresos)       empresa.historico[year].Ingresos = empresa.Ingresos[i];
        if (empresa.EBITDA)         empresa.historico[year].EBITDA = empresa.EBITDA[i];
        if (empresa.EBIT)           empresa.historico[year].EBIT = empresa.EBIT[i];
        if (empresa.BeneficioNeto)  empresa.historico[year].BeneficioNeto = empresa.BeneficioNeto[i];
        if (empresa.DPA)            empresa.historico[year].DPA = empresa.DPA[i];
        if (empresa.CotizacionMaxima)   empresa.historico[year].CotizacionMaxima = empresa.CotizacionMaxima[i];
        if (empresa.CotizacionMinima)   empresa.historico[year].CotizacionMinima = empresa.CotizacionMinima[i];
        if (empresa.CashFlowExplotacion)    empresa.historico[year].CashFlowExplotacion = empresa.CashFlowExplotacion[i];
        if (empresa.CashFlowFinanciacion)   empresa.historico[year].CashFlowFinanciacion = empresa.CashFlowFinanciacion[i];
        if (empresa.CashFlowInversion)      empresa.historico[year].CashFlowInversion = empresa.CashFlowInversion[i];
        if (empresa.DeudaNeta)              empresa.historico[year].DeudaNeta = empresa.DeudaNeta[i];
        if (empresa.ROA)                    empresa.historico[year].ROA = empresa.ROA[i];
    }
}

function codifica(nombre) {
    nombre = nombre.replace('&','');
    nombre = nombre.replace(' ','_');
    return nombre;
}
