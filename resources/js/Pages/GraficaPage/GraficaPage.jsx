import { useEffect, useState } from "react";
import axios from "axios";
import NavBarGrafica from "../../Components/UI/NavGraf/NavBusGraf";
import Grafica from "../../Components/UI/Grafica/Grafica";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import PagesLayout from "../../Layouts/PagesLayout/PagesLayout";

/** Función para renderizar el componente que contiene la pagina de la grafica
 * @returns {JSX.Element} Pagina de grafica renderizada */
function GraficaPage(){
    // Variable de estado para la información de la barra de navegación
    //const [infoBusGraf, setInfoBusGraf] = useState({ sensor: "", fechas: [] });
    const [infoBusGraf, setInfoBusGraf] = useState(null);
    // Variable de estado para el almacenamiento de los datos
    const [datosGraf, setDatosGraf] = useState([]);
    /* Variables de estado para el modal: titulo, contenido del modal, apertura y cierre */
    const [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(<></>),
    [modalOpen, setModalOpen] = useState(false);

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // useEffect para monitorear el cambio de datos en la seleccion
    useEffect(() => {
        // En lugar de utilizar una Función receptora, el useEffect estará monitoreando el cambio de valores desde la barra
        if(infoBusGraf) {
            // Lanzar el modal de carga para la obtención de valores
            setModalTitu("Cargando");
            setModalConte(<Dialog textMsg="Estamos obteniendo la información y podria tardar unos minutos, favor de permanecer a la espera."/>);
            setModalOpen(true);

            // Lanzar un error en caso de que el usuario seleccione la misma fecha
            if(infoBusGraf.arrFechas[0] == infoBusGraf.arrFechas[1]) {
                setModalTitu("Error");
                setModalConte(<Dialog textMsg="Error: No puede seleccionar la misma fecha y hora para buscar."/>);
                setModalOpen(true);
            } else {
                // Lanzar la consulta para la obtencion de información
                obteRegisGraf(infoBusGraf).then((response) => {
                    // Determinar si la respuesta obtenida fue un arreglo
                    if(Array.isArray(response)) {
                        // Establecer la información obtenida y cerrar el modal de carga
                        setDatosGraf(response);
                        setModalOpen(false);
                    } else {
                        // Cambiar el contenido del modal de carga por modal de error
                        setModalTitu("Error");
                        setModalConte(<Dialog textMsg={response}/>);
                        setModalOpen(true);
                    }
                }).catch((errObteDatosBD) => {
                    // Cambiar el contenido del modal de carga por modal de error
                    setModalTitu("Error");
                    setModalConte(<Dialog textMsg={errObteDatosBD}/>);
                    setModalOpen(true);
                });
            }
        }
    }, [infoBusGraf]);

    return(
        <section className="w-full h-full flex flex-col items-center justify-center bg-slate-400">
            <NavBarGrafica infoBus={setInfoBusGraf} />
            <Grafica infoSenSel={infoBusGraf} datosGrafica={datosGraf} />
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

// Establecer PagesLayout como el layout que contendrá a esta pagina
GraficaPage.layout = (page) => <PagesLayout children={page} />
export default GraficaPage;

/** Función para obtener los registros especificados por el filtrado de sensor y fechas
 * @param {Object} infoBus Objeto con el identificador del sensor y el arreglo con las fechas del rango de busqueda
 * @returns {Promise<Array | String>} Promesa con arreglo de información resultante o mensaje de error en caso de acontecer uno */
export async function obteRegisGraf(infoBus){
    try {
        const consulta = await axios.get('/datosGraf', {
            params: {
                senBus: `${infoBus.infoSensor.split(";")[0]}`,
                fechIni: infoBus.arrFechas[0],
                fechFin: infoBus.arrFechas[1]
            },
            timeout: 420000
        });
        return consulta.data.results;
    } catch (errObteRegSenso) {
        // Si ocurrio un error en la petición de busqueda se mostrará aqui
        if (errObteRegSenso.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar el usuario con la información del formulario o porque no se pudo hacer la petición para consultar información (Error contemplado)
            return (typeof(errObteRegSenso.response.data.msgError) == "undefined") ? "Error: Registros de sensor no disponible caso 1, favor de intentar mas tarde." : errObteRegSenso.response.data.msgError;
        } else if (errObteRegSenso.request) {
            // Segundo caso, el cliente lanzó la petición al servidor y este no respondio (Error controlado)
            return("Error: Registros de sensor no disponible caso 2, favor de intentar mas tarde.");
        } else {
            // Tercer caso, ocurrio un error en la petición y por ende en la respuesta del servidor (Error no contemplado y desconocido)
            return("Error: Registros de sensor no disponible caso 3, favor de intentar mas tarde.");
        }
    }
}