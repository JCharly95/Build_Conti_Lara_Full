import Modal from "../../Components/UI/Modal/Modal";
import Dialog from "../../Components/UI/Modal/Plantillas/Dialog";
import { router } from "@inertiajs/react";

export default function LogoutPage(){
    // Limpiar la cache local usada para la sesion
    localStorage.clear();
    // Redireccionamiento hacia el login despues de 2 segundos
    setTimeout( () => ( router.replace({ url: '/' }) ), 2500);
    
    return(
        <Modal titModal="Cerrar Sesión" conteModal={<Dialog textMsg="Gracias por su visita. Nos vemos después"/>} isOpen={true} />
    );
}