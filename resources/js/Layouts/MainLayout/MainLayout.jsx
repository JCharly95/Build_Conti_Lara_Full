import Pie_Pagina from "@/Components/UI/Pie/Pie_Gen";

/** Funcion para establecer el root layout del sistema
 * @param {React.ReactNode} children - Nodo de react con el contenido a mostrar en la pagina
 * @returns {JSX.Element} - Componente JSX con el contenido de la pagina */
export default function MainLayout({ children }){
    return(
        <main className="w-full h-full flex flex-col items-center justify-center font-inter">
            { children }
            <Pie_Pagina />
        </main>
    );
}