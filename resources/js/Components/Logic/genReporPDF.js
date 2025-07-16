import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { getFecha } from "./fecha";

//Información de configuracion para la pagina:
/* Segun la documentacion oficial de jsPDF; la configuracion por defecto para el PDF es; Tamaño de papel: A4, Orientacion: Vertical (Portrait) y Unidad de medicion: milimetros.
Para este caso, se creará un documento con la configuracion de margen "Normal" y el tamaño de hoja: "carta"; acorde a las medidas que maneja word para darle similitud a lo que las personas estan acostumbradas a ver. Para ello, el margen normal de word maneja las medidas: Superior: 2.5 cm, Inferior: 2.5 cm, Izquierda: 3 cm, Derecha: 3 cm y el tamaño de hoja carta tiene las medidas: 21.59 cm * 27.94 cm.
Como es mas facil manejar los cambios de tamaños en mm, sera necesario contemplar la transformacion de cm a mm, para ello se tiene que:
cm -> mm = cm * 10 */
    
/** Función para generar los reportes PDF de la grafica
 * @param {React.RefObject} areaGrafica Referencia del area de la grafica (el equivalente a getElementById)
 * @param {Array} datos Arreglo de arreglos con la información de los registro de la grafica, formato; [fecha, valor]
 * @param {string} nomSensor Nombre del sensor a mostrar en el reporte obtenido desde la lista de la barra de busqueda
 * @param {string} uniMedi Nombre de la unidad de medición que uso el sensor
 * @param {number} fechaInicio Cadena de texto con la fecha de inicio proporcionada por el calendario
 * @param {number} fechaFinal Cadena de texto con la fecha final proporcionada por el calendario */
export default async function CrearReportePDF(areaGrafica, datos, nomSensor, uniMedi, fechaInicio, fechaFinal){

    // Variables de trabajo: Ancho de pagina en mm. Alto de pagina en mm. Margenes Superior e Inferior en mm. Margenes Izquierdo y Derecho en mm. Longitud maxima (ancho) de una linea o elemento en la pagina. Margenes exteriores de las tablas de datos. Posicionador vertical en el documento. Fecha creacion del reporte.
    let pageWidth = 21.59 * 10, pageHeight = 27.94 * 10, marginTopBot = 2.5 * 10, marginLefRig = 3 * 10, maxLineWidth = pageWidth - marginLefRig * 2, marginTbl = (pageWidth - maxLineWidth) / 2, contPosVerti = marginTopBot, fechaCreaRepor = `${getFecha()} hrs`;
    // NOTA; Para el posicionador vertical; con cada elemento agregado en el documento, este incrementará 10 unidades para contemplarlo como separacion entre elementos

    // Crear el objeto del PDF con formato carta, orientacion vertical, unidad de medida en mm y el lenguaje del documento en español de México;
    let doc = new jsPDF({
        format: "letter",
        orientation: "portrait",
        unit: "mm"
    }).setLanguage("es-MX");

    // Establecer la configuracion para el encabezado y agregarlo
    doc.setFont("times", "normal").setFontSize(20);
    doc.text("Reporte Building Continuity", (pageWidth / 2), contPosVerti, null, null, "center");
    contPosVerti += 10;
    
    // Establecer la configuracion para la fecha y hora de la creacion del reporte y agregarlo
    doc.setFontSize(16);
    doc.text(`Creacion de Reporte: ${fechaCreaRepor}`, (pageWidth / 2), contPosVerti, null, null, "center");
    contPosVerti += 10;

    // Establecer la configuracion del tamaño de fuente general para el documento
    doc.setFontSize(12);
    let conteTextoIntro = "El presente reporte contiene la información correspondiente a la búsqueda realizada en el sistema.";
    // Ajustar el contenido del texto, acorde a los margenes laterales y agregarlo al documento
    let msgEntra = doc.splitTextToSize(conteTextoIntro, maxLineWidth);
    doc.text(msgEntra, marginLefRig, contPosVerti);
    contPosVerti += 10;

    // Agregar la seccion de la grafica
    doc.text("Grafica representativa de la búsqueda:", (pageWidth / 2), contPosVerti, null, null, "center");
    contPosVerti += 10;
    // Convetir la imagen a canva y URL Base64; despues agregarla en el documento
    let htmlACanva = await html2canvas(areaGrafica.current, {
        backgroundColor: null
    });
    let imgURL = htmlACanva.toDataURL("image/png");
    doc.addImage(imgURL, "PNG", marginLefRig, contPosVerti, maxLineWidth, 75);
    // En este caso el posicionador aumenta acorde a la altura de la grafica mas los 10 de cada elemento
    contPosVerti += 85;

    // Agregar la seccion de datos generales
    doc.text("Datos generales de búsqueda:", (pageWidth / 2), contPosVerti, null, null, "center");
    contPosVerti += 5;
    // Calcular los datos generales y obtener el objeto con la información de los mismos
    let datosGen = calcuDatosTbl(datos);
    // Preparar la configuracion para la tabla de información general
    let configTblGen = {
        startY: contPosVerti,
        tableWidth: maxLineWidth,
        margin: { left: marginTbl, right: marginTbl },
        head: [['Dato:', 'Valor:']],
        body: [
            ['Sensor seleccionado:', nomSensor],
            ['Unidad de Medida:', uniMedi],
            ['Fecha y Hora Iniciales:',	`${getFecha(fechaInicio * 1000)} hrs`],
            ['Fecha y Hora Finales:', `${getFecha(fechaFinal * 1000)} hrs`],
            ['Fecha y Hora Valor Minimo:', datosGen.fechaValMin],
            ['Valor Minimo:', datosGen.valorMin],
            ['Fecha y Hora Valor Máximo:', datosGen.fechaValMax],
            ['Valor Máximo:', datosGen.valorMax],
            ['Valor Promedio General', datosGen.valorProm]
        ],
        theme: 'grid'
    };
    // Agregar la tabla de datos generales y actualizar el posicionador vertical
    contPosVerti = agreTbl(doc, configTblGen) + 10;

    // Para este punto, no queda mucho espacio en la hoja, por lo que la información de busqueda especifica será agregada en una hoja nueva y se reestablecera el posicionador vertical
    doc.addPage("letter","portrait");
    contPosVerti = marginTopBot;

    // Agregar la seccion de datos especificos y actualizar el posicionador vertical
    doc.text("Datos específicos de búsqueda:", (pageWidth / 2), contPosVerti, null, null, "center");
    contPosVerti += 5;
    contPosVerti = calcuDatosEspeci(datos, doc, contPosVerti, maxLineWidth, marginTbl) + 10;

    // Agregar el pie de pagina al documento
    agrePie(doc, pageHeight, pageWidth);

    // Guardar el documento
    doc.save(`Reporte Building Continuity ${nomSensor} ${fechaCreaRepor.split(";")[0]}.pdf`);
}

/** Función para generar y agregar una tabla al documento PDF, ingresando la información correspondiente desde la llamada de la función
 * @param {jsPDF} objDoc Objecto que contiene el documento PDF del reporte
 * @param {Object} objConfig Objeto con la configuracion e información establecida para generar la tabla
 * @returns {number} La posicion vertical del la ultima tabla dibujada cortesia de autotable */
function agreTbl(objDoc, objConfig){
    // Generar y agregar la tabla solicitada en el documento
    autoTable(objDoc ,objConfig);
    // Regresar la ultima posicion de pintado de la tabla
    return objDoc.lastAutoTable.finalY;
}

/** Función para calcular la información de la tabla general de valores
 * @param {Array} arrInfo Arreglo de arreglos con la información en formato [fecha, valor] */
function calcuDatosTbl(arrInfo){
    let objRes = { valorMin: 0, fechaValMin: "", valorMax: 0, fechaValMax: "", valorProm: 0 },
    arrDatos = arrInfo.map((registro) => (registro[1]));

    // Calcular el promedio y redondearlo a 2 decimales
    let promedio = parseFloat((arrDatos.reduce((valPrev, valActu) => (valActu += valPrev)) / arrDatos.length).toFixed(2));
    // Calcular el valor maximo
    let valMax = arrDatos.reduce((valPrev, valActu) => ((valActu > valPrev) ? valActu : valPrev));
    // Calcular el valor minimo
    let valMin = arrDatos.reduce((valPrev, valActu) => ((valActu < valPrev) ? valActu : valPrev));

    // Agregar la información al objeto de respuesta
    objRes.valorMin = valMin;
    objRes.valorMax = valMax;
    objRes.valorProm = promedio;
    
    // Recorrer el arreglo de datos para obtener las fechas de los datos obtenidos
    arrInfo.forEach((registro) => {
        // Obtener la fecha del valor maximo
        if(registro[1] === valMax)
            objRes.fechaValMax = `${getFecha(registro[0])} hrs`;
        
        // Obtener la fecha del valor minimo
        if(registro[1] === valMin)
            objRes.fechaValMin = `${getFecha(registro[0])} hrs`;
    });

    return objRes;
}

/** Función para calcular y pintar la información de las tablas de busqueda especifica
 * @param {Array} arrInfo Arreglo de arreglos con la información en formato [fecha, valor]
 * @param {jsPDF} objDoc Objecto que contiene el documento PDF del reporte
 * @param {number} iniVerti Ubicacion de la coordenada vertical para comenzar a pintar
 * @param {number} ancho Longitud de anchura para las tablas de datos
 * @param {number} margen Longitud del margen lateral para las tablas de datos
 * @returns {number} La posicion vertical del la ultima tabla dibujada cortesia de autotable */
function calcuDatosEspeci(arrInfo, objDoc, iniVerti, ancho, margen){
    // Crear un arreglo con las fechas de los registros y otro con las fechas filtradas (no repetidas)
    let arrFechas = arrInfo.map((registro) => ( getFecha(registro[0]).split(";")[0] )),
    objFechas = new Set(arrFechas), arrFechasNoRep = [...objFechas];
    // Crear el contador de posiciones para recorrer el arreglo de fechas obtenido y una copia de la coordenada vertical para estarla actualizando acorde a la generacion de tablas
    let posArrFech = 0, contPosVerti = iniVerti;
    
    // Crear un ciclo para obtener la información de cada tabla y pintarla en el documento. OJO: Este ciclo Funcióna en cuestion al posicionador que se usara para recorrer el arreglo de las fechas filtradas y este continuará hasta que se hayan recorrido todos los valores del arreglo de fechas
    while(posArrFech < arrFechasNoRep.length) {
        // Obtener la fecha a comparar en la iteracion
        let fechaCmp = arrFechasNoRep[posArrFech];
        // Crear un arreglo solo con los registros que contengan la fecha a comparar
        let arrEval = arrInfo.filter((registro) => ( getFecha(registro[0]).split(";")[0] == fechaCmp ));
        // Enviar el arreglo de datos generado para calcular los datos requeridos para mostrar la tabla
        let datosCalcu = calcuDatosTbl(arrEval);

        // Preparar el objeto de configuracion para la tabla de datos
        let configTbl = {
            startY: contPosVerti,
            tableWidth: ancho,
            margin: { left: margen, right: margen },
            head: [[{ content: fechaCmp, colSpan: 2, styles: { halign: 'center' }}]],
            body: [
                ['Fecha y Hora Valor Minimo:', datosCalcu.fechaValMin],
                ['Valor Minimo:', datosCalcu.valorMin],
                ['Fecha y Hora Valor Máximo:', datosCalcu.fechaValMax],
                ['Valor Máximo:', datosCalcu.valorMax],
                ['Valor Promedio', datosCalcu.valorProm]
            ],
            theme: 'grid'
        };

        // Pintar la tabla de datos y actualizar la coordenada de pintado vertical
        contPosVerti = agreTbl(objDoc, configTbl) + 10;
        // Incrementar el contador para seguir recorriendo el arreglo de fechas
        posArrFech++;
    }

    // Regresar la ultima posicion de pintado de la tabla
    return objDoc.lastAutoTable.finalY;
}

/** Función para agregar los pies de pagina en el reporte
 * @param {jsPDF} objDoc Objecto que contiene el documento PDF del reporte
 * @param {number} pageHeight Altura de pagina configurada
 * @param {number} pageWidth Anchura de pagina configurada */
function agrePie(objDoc, pageHeight, pageWidth){
    // Obtener la cantidad de paginas para determinar cuantos pies se van a poner
    let cantPagi = objDoc.internal.getNumberOfPages();

    // Configurar el texto para presentarlo como pie de pagina
    objDoc.setFont('helvetica', 'italic').setFontSize(8);
    // Crear un ciclo para recorrer todo el documento e ir agregando el pie de pagina en cada una
    for (var conta = 1; conta <= cantPagi; conta++) {
        objDoc.setPage(conta);
        objDoc.text(`Building Continuity ${new Date().getFullYear()} Copyright © Todos los derechos reservados`, (pageWidth / 2), (pageHeight - 5), null, null, "center");
    }
}