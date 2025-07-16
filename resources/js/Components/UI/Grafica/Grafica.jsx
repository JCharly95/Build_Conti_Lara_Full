import { useState, useEffect, useRef } from "react";
import { getFecha } from "../../Logic/fecha";
import useVentaDimen from "../../Hooks/tamVentaHook";
import ReactApexChart from "react-apexcharts";
import esp from "apexcharts/dist/locales/es.json";
import CrearReportePDF from "../../Logic/genReporPDF";

// infoSenSel: { infoSensor: sensorBusc, arrFechas: arrFechSel }
export default function Grafica({ infoSenSel, datosGrafica }){
    // Variable de estado (hook personalizado) que trae un objeto con las dimensiones de pantalla
    let ventaDimen = useVentaDimen();
    // Desestructurar los elementos de la grafica a partir del arreglo de registros (series y labels)
    let { dataGraf, labelsGraf } = desgloDatos(datosGrafica);
    // Referencia del area de la grafica
    const areaGrafRef = useRef(null);
    // Variable de estado con las opciones de configuración para la grafica
    const [opcsGrafi, setOpcsGrafi] = useState(opcsDefecGraf);
    // Variable de estado con el arreglo de datos para la grafica
    const [seriesGraf, setSeriesGraf] = useState([]);
    
    useEffect(() => {
        // Mostrar la información en la grafica cuando se tengan datos
        if(infoSenSel && datosGrafica.length > 0) {
            setOpcsGrafi(defOpcsGraf(areaGrafRef, dataGraf, labelsGraf, infoSenSel.infoSensor, infoSenSel.arrFechas));
            setSeriesGraf([{
                name: `Registro ${infoSenSel.infoSensor.split(";")[1]}`,
                data: dataGraf
            }]);
        } else if(infoSenSel && datosGrafica.length <= 0) {
            // No mostrar información en la grafica si no se encontraron registros
            setSeriesGraf([]);
            setOpcsGrafi(noDatosGraf);
        }
    }, [infoSenSel, datosGrafica]);

    return(
        <section ref={areaGrafRef} className="md:h-[73dvh] mt-4 z-0">
            <ReactApexChart type="line" options={opcsGrafi} series={seriesGraf} width={(ventaDimen.width) / 1.5} height={(ventaDimen.height) / 1.5}/>
        </section>
    );
}

/** Función para desglozar los elementos de la grafica (datos y etiquetas)
 * @param {Array} arrInfoBD Arreglo de valores con los registros a mostrar */
function desgloDatos(arrInfoBD){
    let arrDatos = [], arrLabels = [];

    // Recorrer el arreglo de registros para desglozar la información requerida
    arrInfoBD.forEach((registro) => {
        // Establecer el arreglo "series" que usa la grafica para mostrar los valores, donde cada elemento es un par ordenado de tipo [fecha, valor]
        arrDatos.push([
            new Date(parseInt(`${registro.TIMESTAMP}`)),
            parseFloat(parseFloat(`${registro.VALUE}`).toFixed(2))
        ]);
        // Establecer el arreglo de etiquetas que utilizara la grafica para mostrar etiquetas
        arrLabels.push({
            valor: parseFloat(parseFloat(`${registro.VALUE}`).toFixed(2)),
            estatus: (`${registro.STATUS_TAG}` === "{ok}") ? "Activo" : (`${registro.STATUS_TAG}` === "{down}") ? "Inactivo" : "Indefinido"
        });
    });

    return { dataGraf: arrDatos, labelsGraf: arrLabels };
}

/** Función para establecer las opciones por defecto para la grafica
 * @returns Objeto de configuracion inicial Apexchart para renderizar una grafica vacia */
function opcsDefecGraf(){
    return {
        chart: {
            defaultLocale: "es",
            locales: [esp],
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false,
            }
        },
        yaxis: {
            title: {
                text: "Esperando Selección"
            }
        }
    }
}

/** Función para establecer las opciones de la grafica cuando no se encontró información
 * @returns Objeto de configuración para renderizar una grafica sin datos */
function noDatosGraf(){
    return {
        chart: {
            defaultLocale: "es",
            locales: [esp],
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false,
            }
        },
        yaxis: {
            title: {
                text: "Información no encontrada"
            }
        },
        grid: {
            show: false,
        },
        noData: {
            text: 'El sistema no encontró información relacionada a su consulta'
        }
    }
}

/** Función para establecer las opciones de la grafica
 * @param {React.RefObject} areaGrafRef - Referencia del area de la grafica (el equivalente a getElementById)
 * @param {Array} grafDatos - Arreglo de valores con la información de los registros
 * @param {Array} grafEtiq - Arreglo de strings con las etiquetas de los registros
 * @param {String} senDatos - Cadena de texto con la información concatenada del sensor: `${sensor.valor};${sensor.nombre};${sensor.unidad}`
 * @param {Array} fechas - Arreglo de 2 elementos con las fechas [inicio, fin] de la selección
 * @returns Objeto de configuración Apexcharts para renderizar graficas con valores */
function defOpcsGraf(areaGrafRef, grafDatos, grafEtiq, senDatos, fechas){
    let nomSensor = senDatos.split(";")[1], nomUniMedi = senDatos.split(";")[2];

    return {
        title: {
            text: `Registros ${nomSensor}`
        },
        chart: {
            defaultLocale: "es",
            locales: [esp],
            animations: {
                initialAnimation: {
                    enabled: false
                }
            },
            toolbar: {
                tools: {
                    customIcons: [{
                        icon: 'PDF',
                        title: 'Exportar a PDF',
                        class: 'custom-icon',
                        click: function exportPDF(){
                            CrearReportePDF(areaGrafRef, grafDatos, nomSensor, nomUniMedi, fechas[0], fechas[1]);
                        }
                    }]
                },
                export: {
                    csv: {
                        headerCategory: "Fecha",
                        filename: `BMS Grafica de ${getFecha()}; Registros ${nomSensor}`
                    },
                    svg: {
                        filename: `BMS Grafica de ${getFecha()}; Registros ${nomSensor}`
                    },
                    png: {
                        filename: `BMS Grafica de ${getFecha()}; Registros ${nomSensor}`
                    }
                }
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false,
            }
        },
        yaxis: {
            title: {
                text: `Unidad de Medición: ${nomUniMedi}`
            }
        },
        grid: {
            show: true,
        },
        tooltip: {
            x: {
                format: "dd-MMM-yyyy; HH:mm:ss"
            },
            custom: function({series, seriesIndex, dataPointIndex, w}){
                for(let cont = 0; cont < grafEtiq.length; cont++) {
                    let valor = grafEtiq[cont].valor, status = grafEtiq[cont].estatus;
                    if(valor === series[seriesIndex][dataPointIndex]) {
                        switch(status) {
                            case "Activo":
                                return `<section class="w-full font-bold">
                                    <section class="border rounded border-gray-400 bg-white flex flex-col justify-between">
                                        <section class="bg-gray-700 rounded-t px-1">
                                            <span class="text-white">${w.config.series[seriesIndex].name}:</span>
                                        </section>
                                        <section class="p-1">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section class="p-1">
                                            <span>Estado: </span><span class="text-green-600">Activo</span>
                                        </section>
                                    </section>
                                </section>`;
                            case "Inactivo":
                                return `<section class="w-full font-bold">
                                    <section class="border rounded border-gray-400 bg-white flex flex-col justify-between">
                                        <section class="bg-gray-700 rounded-t px-1">
                                            <span class="text-white">${w.config.series[seriesIndex].name}:</span>
                                        </section>
                                        <section class="p-1">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section class="p-1">
                                            <span>Estado: </span><span class="text-red-600">Inactivo</span>
                                        </section>
                                    </section>
                                </section>`;
                            default:
                                return `<section class="w-full font-bold">
                                    <section class="border rounded border-gray-400 bg-white flex flex-col justify-between">
                                        <section class="bg-gray-700 rounded-t px-1">
                                            <span class="text-white">${w.config.series[seriesIndex].name}:</span>
                                        </section>
                                        <section class="p-1">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section class="p-1">
                                            <span>Estado: </span><span class="text-gray-600">Indefinido</span>
                                        </section>
                                    </section>
                                </section>`;
                        }
                    }
                }
            }
        },
        stroke: {
            width: 3
        }
    }
}