/** Funcion para crear los modales de proceso; los que requieran de una respuesta de usuario para confirmar o cancelar el proceso.
 * @param {Object} props - Objeto con las propiedades del componente
 * @param {String} props.textMsg - Cadena de texto con el mensaje a mostrar
 * @param {Boolean} props.opcSel - Bandera booleana que contendra la respuesta seleccionada
 * @returns {JSX.Element} El componente que contiene el aviso a mostrar. */
export default function DialogCancelar({ textMsg, opcSel }){
    return(
        <section>
            <section className="flex flex-col items-center text-justify text-black mb-2">
                <label className="text-base">{ textMsg }</label>
            </section>
            <section className="flex items-center justify-center pt-1">
                <button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3" onClick={() => ( opcSel(true) )}>Cancelar recuperación</button>
                <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-3" onClick={() => ( opcSel(false) )}>Continuar recuperación</button>
            </section>
        </section>
    );
}