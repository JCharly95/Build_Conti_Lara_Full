/** Funcion para crear el pie del sistema
 * @returns {JSX.Element} El componente que contiene el pie del sistema. */
export default function Pie_Pagina(){
    return(
        <footer className="fixed bottom-0 bg-[#00304E] w-full lg:py-7 py-2 inline-flex items-center justify-center">
            <img src="/images/Icono_Compacto.png" alt="Icono Sistema" height={30} width={30} className="rounded-md lg:mr-2" />
            <p className="text-white text-center">Building Continuity {new Date().getFullYear()} Copyright © Todos los derechos reservados</p>
        </footer>
    );
}