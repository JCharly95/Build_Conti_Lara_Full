import React, { useEffect, useState } from "react";
import { getFecha } from "../../Components/Logic/fecha";
import { User, Calendar, Mail, Clock } from "react-feather";
import PagesLayout from "../../Layouts/PagesLayout/PagesLayout";

/** Funcion para renderizar el componente que contiene la pagina del perfil
 * @param {object} props - Objeto con las propiedades ingresadas para la visualización de la pagina
 * @param {Array} props.inforUser - Arreglo con la información del usuario para mostrar
 * @returns {JSX.Element} Pagina del perfil renderizada */
function PerfilPage({ infoUser }){

    return(
        <section className="w-full md:h-[82dvh] flex flex-col items-center justify-center bg-slate-400 p-5">
            <section className="max-w-screen lg:p-7 p-6 w-full lg:max-w-full lg:flex self-center justify-center">
                <section className="h-full w-full lg:h-auto lg:w-48 flex-none bg-cover lg:rounded-l text-center overflow-hidden border border-gray-400">
                    <img src="/images/Imagen_Usuario.jpg" alt="Imagen de perfil" width={600} height={600} style={{objectFit: 'contain'}}/>
                </section>
                <section className="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
                    <section className="lg:mt-6 mt-0 lg:mb-0 mb-8">
                        <p className="text-sm text-gray-600 flex items-center">
                            <User size={25} className="mr-2"/>
                            ¿Que desea hacer hoy? {infoUser['nomUserSes']}
                        </p>
                        <section className="text-gray-900 font-bold text-xl my-2 inline-flex">
                            <Calendar size={25} className="mr-2"/> La fecha actual es: { getFecha() } hrs.
                        </section>
                        <section className="text-gray-700 text-base flex flex-col mt-2">
                            <section className="inline-flex">
                                <Mail size={25} className="mr-2"/> Su direccion de correo es: { infoUser['dirCorSes'] }
                            </section>
                            <section className="inline-flex mt-3">
                                <Clock size={25} className="mr-2"/> Su ultimo acceso fue: { infoUser['fechUltiAcc'] } hrs.
                            </section>
                        </section>
                    </section>
                </section>
            </section>
        </section>
    );
}

// Establecer PagesLayout como el layout que contendrá a esta pagina
PerfilPage.layout = (page) => <PagesLayout children={page} />
export default PerfilPage;