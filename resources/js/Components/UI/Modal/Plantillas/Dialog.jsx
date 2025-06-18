/** Funcion para crear los modales de avisos o errores de texto simple.
 * @param {Object} props - Objeto con las propiedades del componente
 * @param {String} props.textMsg - Cadena de texto con el mensaje a mostrar
 * @returns {JSX.Element} El componente que contiene el mensaje de aviso a mostrar. */
export default function Dialog({ textMsg }){
    return(
        <section className="text-black">
            <span>{ textMsg }</span>
        </section>
    );
}