/** Función para crear los modales de proceso; los que requieran de una respuesta de usuario para confirmar o cancelar el proceso.
 * @param {object} props - Objeto con las propiedades del componente
 * @param {string} props.textMsg - Cadena de texto con el mensaje a mostrar
 * @param {string} props.textSoli - Cadena de texto con el mensaje a mostrar en los botones
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.opcSel - Hook de estado booleano para establecer la respuesta seleccionada
 * @returns {JSX.Element} El componente que contiene el aviso a mostrar. */
export default function DialogCancelar({ textMsg, textSoli, opcSel }){
    // Preparar un arreglo de strings en caso que el mensaje contenga mas de una oración
    let arrTexto = [];

    // Determinar si el contenido a mostrar trae saltos de linea
    if(textMsg.includes("\n") || textMsg.includes("\\n"))
        arrTexto = (textMsg.includes("\n")) ? textMsg.split("\n") : textMsg.split("\\n");

    // Conservar todos los elementos que no sean "blancos" o compuestos de solo espacios en blanco
    arrTexto = arrTexto.filter((valor) => (valor !== '' && valor !== ' '));

    return(
        <section>
            <section className="flex flex-col items-center text-justify text-black mb-2">
                {
                    (arrTexto.length > 0) ? arrTexto.map((oracion, idx) => (<span key={idx}>{ oracion }<br /></span>))
                    : <span>{ textMsg }</span>
                }
            </section>
            <section className="flex items-center justify-center pt-1">
                <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={() => ( opcSel(true) )}>Cancelar { textSoli }</button>
                <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3 cursor-pointer" onClick={() => ( opcSel(false) )}>Continuar { textSoli }</button>
            </section>
        </section>
    );
}