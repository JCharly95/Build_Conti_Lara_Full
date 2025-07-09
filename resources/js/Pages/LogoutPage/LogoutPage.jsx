import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import { router } from "@inertiajs/react";
import PagesLayout from "../../Layouts/PagesLayout/PagesLayout";

/** Funcion para renderizar el componente que contiene la pagina para el cierre de sesión
 * @returns {JSX.Element} Pagina cierre de sesión renderizada */
function LogoutPage(){
    // Limpiar la cache local usada para la sesion
    //localStorage.clear();
    // Redireccionamiento hacia el login despues de 2 segundos
    setTimeout( () => ( router.visit('/', { method: 'get', replace: true }) ), 2000);
    
    return(
        <Modal titModal="Cerrar Sesión" conteModal={<Dialog textMsg="Gracias por su visita. Nos vemos después"/>} isOpen={true} />
    );
}

// Establecer PagesLayout como el layout que contendrá a esta pagina
LogoutPage.layout = (page) => <PagesLayout children={page} />
export default LogoutPage;