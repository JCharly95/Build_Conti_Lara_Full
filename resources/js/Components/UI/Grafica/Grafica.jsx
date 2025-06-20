//import React, { useState, useEffect, useRef } from "react";
import { useState, useEffect, useRef } from "react";
import { getFecha } from "../../Logic/fecha";
import useVentaDimen from "../../Hooks/tamVentaHook";
import ReactApexChart from "react-apexcharts";
import esp from "apexcharts/dist/locales/es.json";
import CrearReportePDF from "../../Logic/genReporPDF";
/*import Modal from "../Modal/Modal";
import Dialog from "../Modal/Plantillas/Dialog";*/

// infoSenSel: { infoSensor: sensorBusc, arrFechas: arrFechSel }
export default function Grafica({ infoSenSel, datosGrafica }){
    // Variable de estado (hook personalizado) que trae un objeto con las dimensiones de pantalla
    let ventaDimen = useVentaDimen();
    // Desestructurar los elementos de la grafica a partir del arreglo de registros (series y labels)
    let { dataGraf, labelsGraf } = desgloDatos(datosGrafica);
    // Referencia del area de la grafica
    const areaGrafRef = useRef(null);
    /* Establecer las opciones de la grafica
    let opcsGrafi = defOpcsGraf(areaGrafRef, dataGraf, labelsGraf, infoSenSel.infoSensor, infoSenSel.arrFechas);
    // Establecer los datos de la grafica (series)
    let seriesGraf = [{
        name: `Registro ${infoSenSel.infoSensor.split(";")[1]}`,
        data: dataGraf
    }];*/
    // Variable de estado con la configuracion de la grafica
    const [opcsGrafi, setOpcsGrafi] = useState(opcsDefecGraf);
    // Variable de estado con el arreglo de registros para la grafica
    const [seriesGraf, setSeriesGraf] = useState([]);
    /* Variables de estado para el modal: titulo, contenido del modal, apertura y cierre 
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);
    
    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );*/

    useEffect(() => {
        if(infoSenSel && datosGrafica){
            setOpcsGrafi(defOpcsGraf(areaGrafRef, dataGraf, labelsGraf, infoSenSel.infoSensor, infoSenSel.arrFechas));
            setSeriesGraf([{
                name: `Registro ${infoSenSel.infoSensor.split(";")[1]}`,
                data: dataGraf
            }]);
        }
    }, [infoSenSel, datosGrafica]);

    return(
        <section>
            <section ref={areaGrafRef} className="md:h-[73dvh] mt-4 z-0">
                <ReactApexChart type="line" options={opcsGrafi} series={seriesGraf} width={(ventaDimen.width) / 1.5} height={(ventaDimen.height) / 1.5}/>
            </section>
            {/* modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> */}
        </section>
    );
}

/** Función para desglozar los elementos de la grafica (datos y etiquetas)
 * @param {Array} arrInfoBD Arreglo de valores con los registros a mostrar */
function desgloDatos(arrInfoBD){
    let arrDatos = [], arrLabels = [];

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

/** Funcion para establecer las opciones por defecto para la grafica
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
                text: "Esperando Seleccion"
            }
        }
    }
}

/** Funcion para establecer las opciones de la grafica
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
        tooltip: {
            x: {
                format: "dd-MMM-yyyy; HH:mm:ss"
            },
            custom: function({series, seriesIndex, dataPointIndex, w}){
                for(let cont = 0; cont < grafEtiq.length; cont++){
                    let valor = grafEtiq[cont].valor, status = grafEtiq[cont].estatus;
                    if(valor === series[seriesIndex][dataPointIndex]){
                        switch(status){
                            case "Activo":
                                return `<section style="width: 100%;font-weight: 700;">
                                    <section style="border-width: 1px;border-radius: 0.25rem;--tw-border-opacity: 1;border-color: rgb(156 163 175 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color: rgb(255 255 255 / var(--tw-bg-opacity));justify-content: space-between;">
                                        <section style="--tw-bg-opacity: 1;background-color: rgb(55 65 81 / var(--tw-bg-opacity));border-top-left-radius: 0.375rem;border-top-right-radius: 0.375rem;padding: 0.25rem">
                                            <span style="--tw-text-opacity: 1;color: rgb(255 255 255 / var(--tw-text-opacity));">${w.config.series[seriesIndex].name}: </span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Estado: </span><span style="--tw-text-opacity: 1;color: rgb(22 163 74 / var(--tw-text-opacity));">Activo</span>
                                        </section>
                                    </section>
                                </section>`;
                            case "Inactivo":
                                return `<section style="width: 100%;font-weight: 700;">
                                    <section style="border-width: 1px;border-radius: 0.25rem;--tw-border-opacity: 1;border-color: rgb(156 163 175 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color: rgb(255 255 255 / var(--tw-bg-opacity));justify-content: space-between;">
                                        <section style="--tw-bg-opacity: 1;background-color: rgb(55 65 81 / var(--tw-bg-opacity));border-top-left-radius: 0.375rem;border-top-right-radius: 0.375rem;padding: 0.25rem">
                                            <span style="--tw-text-opacity: 1;color: rgb(255 255 255 / var(--tw-text-opacity));">${w.config.series[seriesIndex].name}: </span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Estado: </span><span style="--tw-text-opacity: 1;color: rgb(220 38 38 / var(--tw-text-opacity));">Inactivo</span>
                                        </section>
                                    </section>
                                </section>`;
                            default:
                                return `<section style="width: 100%;font-weight: 700;">
                                    <section style="border-width: 1px;border-radius: 0.25rem;--tw-border-opacity: 1;border-color: rgb(156 163 175 / var(--tw-border-opacity));--tw-bg-opacity: 1;background-color: rgb(255 255 255 / var(--tw-bg-opacity));justify-content: space-between;">
                                        <section style="--tw-bg-opacity: 1;background-color: rgb(55 65 81 / var(--tw-bg-opacity));border-top-left-radius: 0.375rem;border-top-right-radius: 0.375rem;padding: 0.25rem">
                                            <span style="--tw-text-opacity: 1;color: rgb(255 255 255 / var(--tw-text-opacity));">${w.config.series[seriesIndex].name}: </span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Valor: ${series[seriesIndex][dataPointIndex]}</span>
                                        </section>
                                        <section style="padding: 0.25rem">
                                            <span>Estado: </span><span style="--tw-text-opacity: 1;color: rgb(75 85 99 / var(--tw-text-opacity));">Indefinido</span>
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
        },
        noData: {
            text: 'Preparando información, aguarde por favor...'
        }
    }
}