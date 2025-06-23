import { useEffect, useState } from "react";
import NavBarGrafica from "../../Components/UI/NavGraf/NavBusGraf";
import Grafica from "../../Components/UI/Grafica/Grafica";
import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";

export default function GraficaPage(){
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
        // En lugar de utilizar una funcion receptora, el useEffect estará monitoreando el cambio de valores desde la barra
        if(infoBusGraf){
            // Lanzar el modal de carga para la obtención de valores
            setModalTitu("Cargando");
            setModalConte(<Dialog textMsg="Estamos obteniendo la información y podria tardar unos minutos, favor de permanecer a la espera."/>);
            setModalOpen(true);

            // Lanzar un error en caso de que el usuario seleccione la misma fecha
            if(infoBusGraf.arrFechas[0] == infoBusGraf.arrFechas[1]){
                setModalTitu("Error");
                setModalConte(<Dialog textMsg="Error: No puede seleccionar la misma fecha y hora para buscar."/>);
            } else {
                // Lanzar la consulta para la obtencion de informacion
                obteRegisGraf(infoBusGraf).then((response) => {
                    // Establecer la información obtenida
                    setDatosGraf(response);
                }).catch((errObteDatosBD) => {
                    // Cambiar el contenido del modal de carga por modal de error, pero continuar con la visualizacion
                    setModalTitu("Error");
                    setModalConte(<Dialog textMsg={errObteDatosBD}/>);
                }).finally(() => {
                    // Ocultar el modal de carga (o error) si fue el caso
                    setModalOpen(false);
                });
            }
        }
    }, [infoBusGraf]);

    // Función para establecer la información obtenida desde la barra de busqueda
    /*const infoSelec = (valInfo) => (
        setInfoBusGraf({ sensor: valInfo.infoSensor, fechas: valInfo.arrFechas })
    );*/

    return(
        <section className="w-full h-full flex flex-col items-center justify-center bg-slate-400 pt-1">
            <NavBarGrafica infoBus={setInfoBusGraf} />
            <Grafica infoSenSel={infoBusGraf} datosGrafica={datosGraf} />
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}

/** Funcion para obtener los registros especificados por el filtrado de sensor y fechas
 * @param {Object} infoBus Objeto con el identificador del sensor y el arreglo con las fechas del rango de busqueda
 * @returns {Promise<Array | String>} Promesa con arreglo de informacion resultante o mensaje de error en caso de acontecer uno */
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
        // Si ocurrio un error en la peticion de busqueda se mostrará aqui
        if (errObteRegSenso.response) {
            // Primer caso, el servidor tiró un error 500 programado por no encontrar el usuario con la información del formulario o porque no se pudo hacer la peticion para consultar información (Error contemplado)
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