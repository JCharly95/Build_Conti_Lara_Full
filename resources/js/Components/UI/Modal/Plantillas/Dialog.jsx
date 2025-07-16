/** Función para crear los modales de avisos o errores de texto simple.
 * @param {Object} props - Objeto con las propiedades del componente
 * @param {String} props.textMsg - Cadena de texto con el mensaje a mostrar
 * @returns {JSX.Element} El componente que contiene el mensaje de aviso a mostrar. */
export default function Dialog({ textMsg }){
    // Preparar un arreglo de strings en caso que el mensaje contenga mas de una oración
    let arrTexto = [];

    // Determinar si el contenido a mostrar trae saltos de linea
    if(textMsg.includes("\n") || textMsg.includes("\\n"))
        arrTexto = (textMsg.includes("\n")) ? textMsg.split("\n") : textMsg.split("\\n");

    // Conservar todos los elementos que no sean "blancos" o compuestos de solo espacios en blanco
    arrTexto = arrTexto.filter((valor) => (valor !== '' && valor !== ' '));

    return(
        <section className="text-black">
            {
                (arrTexto.length > 0) ? arrTexto.map((oracion, idx) => (<span key={idx}>{ oracion }<br /></span>))
                : <span>{ textMsg }</span>
            }
        </section>
    );
}