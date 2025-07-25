import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { X, Menu } from "react-feather";

/** Función para establecer el componente de la barra de navegación dentro del sistema
 * @returns {JSX.Element} Barra de navegación renderizada */
export default function Barra_Navegacion(){
    // Variable de estado para visibilidad de la barra
    const [navBar, setNavBar] = useState(false);
    // Variable con el logo de la barra
    let logo = <img src="/images/Icono_Nombre.png" alt="Imagen Logo" width={225} height={225} className="rounded-md"/>;
    let logoMov = <img src="/images/Icono_Compacto.png" alt="Imagen Logo" width={75} height={75} className="rounded-md"/>;
    // Hook de inertia para determinar la pagina activa
    const { url } = usePage();

    // Cambiar el estado de visibilidad de la barra de navegación en moviles
    const handleNav = () => { setNavBar(!navBar) };
    
    return(
        <nav className="bg-white flex justify-start items-center w-full mx-auto pl-2 pr-3 py-2 z-50">
            {/* Logo General */}
            <h1 className="w-full text-xl font-bold text-[#00df9a]">
                { logo }
            </h1>
            {/* Estilo de Navegación para Escritorio */}
            <section className="hidden md:flex py-0.5">
                <Link href="/grafica" replace className={`hover:text-white hover:bg-[#044660] border border-gray-600 rounded-xl my-1 mx-3 px-3 cursor-pointer duration-300 text-black align-middle content-center ${(url === "/grafica") ? "text-white border-2 border-blue-800 bg-[#044660] hover:bg-blue-400" : ""}`}>
                    Grafica
                </Link>
                <Link href="/perfil" replace className={`hover:text-white hover:bg-[#044660] border border-gray-600 rounded-xl my-1 mx-3 px-3 cursor-pointer duration-300 text-black align-middle content-center ${(url === "/perfil") ? "text-white border-2 border-blue-800 bg-[#044660] hover:bg-blue-400" : ""}`}>
                    Perfil
                </Link>
                <Link href="/cerSes" replace className="hover:text-white hover:bg-[#044660] border border-gray-600 rounded-xl my-1 mx-3 px-3 cursor-pointer duration-300 text-black align-middle content-center text-sm">
                    Cerrar Sesión
                </Link>
            </section>
            {/* Icono de navegación movil */}
            <section onClick={handleNav} className="block lg:hidden border-2 border-black rounded-md p-1">
                {(navBar) ? <X size={20} className="cursor-pointer" /> : <Menu size={20} color="black" className="cursor-pointer" />}
            </section>
            {/* Estilo de Navegación para Moviles */}
            <section className={ (navBar) ? "fixed w-[60%] h-full lg:hidden left-0 top-0 border-r border-r-gray-900 bg-white ease-in-out duration-500" : "w-[60%] ease-in-out duration-500 fixed top-0 bottom-0 -left-full" }>
                {/* Logo Barra Moviles */}
                <h1 className="w-full text-xl font-bold text-[#00df9a] m-3 justify-items-center">
                    { logoMov }
                </h1>
                {/* Componentes de navegación para moviles */}
                <Link href="grafica" replace className={`block hover:text-white hover:bg-[#044660] text-black p-4 text-center rounded-xl m-2 cursor-pointer duration-300 border border-gray-600 ${(url === "/grafica") ? "text-white border-2 border-blue-800 bg-[#044660] hover:bg-blue-400" : ""}`}>
                    Grafica
                </Link>
                <Link href="perfil" replace className={`block hover:text-white hover:bg-[#044660] text-black p-4 text-center rounded-xl m-2 cursor-pointer duration-300 border border-gray-600 ${(url === "/perfil") ? "text-white border-2 border-blue-800 bg-[#044660] hover:bg-blue-400" : ""}`}>
                    Perfil
                </Link>
                <Link href="/cerSes" replace className="block hover:text-white hover:bg-[#044660] text-black p-4 text-center rounded-xl m-2 cursor-pointer duration-300 border border-gray-600">
                    Cerrar Sesión
                </Link>
            </section>
        </nav>
    );
}