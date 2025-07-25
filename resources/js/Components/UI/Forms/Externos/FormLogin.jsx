import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "react-feather";
import Modal from "../../Modal/Modal";
import Dialog from "../../Modal/Plantillas/Dialog";

/** Función para renderizar el formulario de acceso
 * @param {object} props - Objeto con las propiedades ingresadas para la visualización del formulario
 * @param {React.SetStateAction<string>} props.chgForm - Función para establecer el nombre del formulario a cambiar, mostrar o regresar
 * @returns {JSX.Element} Componente del formulario de acceso */
export default function FormAcceso({ chgForm }){
    /* Variables de trabajo:
    Variable de estado para establecer tipo de campo en la contraseña en el login
    Variable de estado para establecer el icono a mostrar en el boton de mostrar contraseña
    Variable de estado para establecer el titulo a mostrar del boton cuando se tenga el puntero encima de este
    Variables de estado para el modal: titulo, contenido del modal y visibilidad del mismo
    Hook para el formulario cortesia de inertia para poder controlar el estado de los campos del formulario */
    const [tipInputPas, setTipInputPas] = useState("password"),
    [iconBtnPas, setIconBtnPas] = useState(<Eye id="ojo_abierto" color="black" size={30}/>),
    [btnTipoContra, setBtnTipoContra] = useState("Mostrar Contraseña"),
    [modalTitu, setModalTitu] = useState(""),
    [modalConte, setModalConte] = useState(""),
    [modalOpen, setModalOpen] = useState(false),
    { data, setData, post, processing, errors } = useForm({
        dirCorr: '',
        valPass: ''
    });

    // useEffect para monitorear los errores obtenidos en la validacion
    useEffect(() => {
        if (errors.dirCorr || errors.valPass) {
            setModalTitu("Error");
            setModalConte(<Dialog textMsg={`${errors.dirCorr || ""}\n${errors.valPass || ""}`}/>);
            setModalOpen(true);
        }
    }, [errors]);

    // Mostrar/Ocultar contraseña
    const verPass = () => {
        if(tipInputPas == "password") {
            setTipInputPas("text");
            setBtnTipoContra("Ocultar Contraseña");
            setIconBtnPas(<EyeOff id="ojo_cerrado" color="black" size={30}/>);
        } else {
            setTipInputPas("password");
            setBtnTipoContra("Mostrar Contraseña");
            setIconBtnPas(<Eye id="ojo_abierto" color="black" size={30}/>);
        }
    };

    // Mostrar/Ocultar el modal
    const handleModal = (estado) => ( setModalOpen(estado) );

    // Función de envio para validacion y envio del formulario (refabricada para la incorporación del hook)
    function submitLogForm(event){
        event.preventDefault();
        post('/valiLog');
    }

    // Mostrar el formulario de solicitud para recuperacion de acceso
    const cambiarFomulario = () => {
        chgForm('FormSoliRecuAcc');
    }
    
    return(
        <section className="w-screen h-screen flex justify-center items-center">
            <section className="w-full max-w-sm">
                <form onSubmit={submitLogForm} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <section className="justify-center items-center content-center">
                        <img src="/images/Icono_Compacto.png" alt="Icono Login" width={40} height={40} className="rounded-md mx-auto mb-1" />
                        <p className="text-center text-blue-700 text-xl font-semibold mb-3">Acceso</p>
                    </section>
                    <section className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dirCorr">Dirección de Correo:</label>
                        <input id="dirCorr" type="email" value={data.dirCorr} onChange={(ev) => setData('dirCorr', ev.target.value)} placeholder="alguien@ejemplo.com" autoComplete="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </section>
                    <section className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valPass">Contraseña:</label>
                        <section className="flex justify-normal">
                            <input id="valPass" type={tipInputPas} value={data.valPass} onChange={(ev) => setData('valPass', ev.target.value)} placeholder="******************"  autoComplete="current-password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            <button type="button" title={btnTipoContra} className="shadow appearance-none border rounded px-1 cursor-pointer" onClick={verPass}>{iconBtnPas}</button>
                        </section>
                    </section>
                    <section className="flex items-center justify-between">
                        <button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer">Acceder</button>
                        <button type="button" className="inline-block align-baseline font-bold text-sm border border-red-500 p-2 rounded text-orange-500 hover:bg-yellow-500 hover:text-white cursor-pointer" onClick={cambiarFomulario}>¿Olvidó su contraseña?</button>
                    </section>
                </form>
            </section>
            { modalOpen && <Modal isOpen={handleModal} titModal={modalTitu} conteModal={modalConte}/> }
        </section>
    );
}